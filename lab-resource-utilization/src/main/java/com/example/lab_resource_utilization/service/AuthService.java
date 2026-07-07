package com.example.lab_resource_utilization.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.lab_resource_utilization.dto.LoginRequest;
import com.example.lab_resource_utilization.dto.RegisterRequest;
import com.example.lab_resource_utilization.dto.SignupRequest;
import com.example.lab_resource_utilization.dto.VerifyOtpRequest;
import com.example.lab_resource_utilization.dto.LoginResponse;
import com.example.lab_resource_utilization.entity.Otp;
import com.example.lab_resource_utilization.entity.OtpType;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    /**
     * OLD REGISTER METHOD (kept for backward compatibility)
     * Direct registration without OTP verification
     */
    public String register(RegisterRequest request) {

        // Check whether the email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already registered";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Parse the role string to the Role enum (e.g. "LAB_MANAGER" → Role.LAB_MANAGER)
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        user.setEmailVerified(true); // Auto-verify for old flow
        user.markEmailAsVerified();

        userRepository.save(user);

        return "User registered successfully";
    }

    /**
     * NEW SIGNUP STEP 1: Send OTP to email
     * This validates the data and sends OTP without creating the user yet
     * Returns: [message, otpCode]
     */
    @Transactional
    public String[] initiateSignupWithOtp(SignupRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Validate role
        try {
            Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role specified");
        }

        // Check rate limiting
        if (otpService.isRateLimited(request.getEmail(), OtpType.SIGNUP_VERIFICATION)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting another OTP");
        }

        // Hash the password for storage in OTP record
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create OTP with pending user data
        Otp otp = otpService.createSignupOtp(
            request.getEmail(),
            request.getName(),
            request.getRole().toUpperCase(),
            hashedPassword
        );

        // Send OTP email
        emailService.sendSignupOTP(request.getEmail(), otp.getOtpCode(), request.getName());

        // Return both message and OTP code
        return new String[] {
            "OTP sent to your email. Please verify within 1 minute.",
            otp.getOtpCode()
        };
    }

    /**
     * NEW SIGNUP STEP 1: Send OTP to email (backward compatible)
     * This validates the data and sends OTP without creating the user yet
     */
    @Transactional
    public String initiateSignup(SignupRequest request) {
        String[] result = initiateSignupWithOtp(request);
        return result[0]; // Return just the message
    }

    /**
     * NEW SIGNUP STEP 2: Verify OTP and create account
     */
    @Transactional
    public LoginResponse verifySignupOtp(VerifyOtpRequest request) {
        // Check if email already registered
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Verify OTP
        Optional<Otp> otpOpt = otpService.verifyOtp(
            request.getEmail(), 
            request.getOtp(), 
            OtpType.SIGNUP_VERIFICATION
        );

        if (otpOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid or expired OTP. Please request a new one.");
        }

        Otp otp = otpOpt.get();

        // Create user from OTP data
        User user = new User();
        user.setName(otp.getPendingUserName());
        user.setEmail(otp.getEmail());
        user.setPassword(otp.getPendingPasswordHash()); // Already hashed
        user.setRole(Role.valueOf(otp.getPendingUserRole()));
        user.markEmailAsVerified(); // Mark as verified immediately

        userRepository.save(user);

        // Clean up used OTP
        otpService.cleanupOtps(request.getEmail(), OtpType.SIGNUP_VERIFICATION);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        // Generate JWT token and return login response
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(
            token, 
            user.getEmail(), 
            user.getName(), 
            user.getRole().name(), 
            "Account created successfully! Welcome to the platform."
        );
    }

    /**
     * Resend OTP for signup
     */
    /**
     * Resend OTP for signup - returns [message, otpCode]
     */
    @Transactional
    public String[] resendSignupOtpWithCode(String email) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Get the latest valid OTP to retrieve pending user data
        Optional<Otp> existingOtp = otpService.getLatestValidOtp(email, OtpType.SIGNUP_VERIFICATION);
        
        if (existingOtp.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "No pending signup found. Please start the signup process again.");
        }

        Otp oldOtp = existingOtp.get();

        // Check rate limiting
        if (otpService.isRateLimited(email, OtpType.SIGNUP_VERIFICATION)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting another OTP");
        }

        // Delete old OTP to ensure new one is created
        System.out.println("🔄 Deleting old OTP for email: " + email);
        otpService.cleanupOtps(email, OtpType.SIGNUP_VERIFICATION);

        // Create new OTP with same pending user data
        Otp newOtp = otpService.createSignupOtp(
            email,
            oldOtp.getPendingUserName(),
            oldOtp.getPendingUserRole(),
            oldOtp.getPendingPasswordHash()
        );

        System.out.println("✅ New OTP created: " + newOtp.getOtpCode());

        // Send new OTP email
        emailService.sendSignupOTP(email, newOtp.getOtpCode(), oldOtp.getPendingUserName());

        return new String[] {
            "New OTP sent to your email.",
            newOtp.getOtpCode()
        };
    }

    /**
     * Resend OTP for signup (backward compatible)
     */
    @Transactional
    public String resendSignupOtp(String email) {
        return resendSignupOtpWithCode(email)[0];
    }

    /**
     * LOGIN with email verification check
     */
    public LoginResponse login(LoginRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new LoginResponse("User not found");
        }

        User user = userOpt.get();

        // Check if email is verified
        if (!user.isEmailVerified()) {
            return new LoginResponse("Email not verified. Please complete signup verification.");
        }

        // Compare entered password with encrypted password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse("Invalid password");
        }

        // Update last login time
        user.updateLastLogin();
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getEmail(), user.getName(), user.getRole().name(), "Login successful");
    }

    /**
     * FORGOT PASSWORD STEP 1: Request password reset OTP
     */
    @Transactional
    public String[] requestPasswordResetWithOtp(String email) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, return same message but with empty OTP
            // This way we don't reveal if email exists
            return new String[] {
                "If an account with this email exists, you will receive a password reset OTP.",
                "" // No OTP since user doesn't exist
            };
        }

        User user = userOpt.get();

        // Check rate limiting
        if (otpService.isRateLimited(email, OtpType.PASSWORD_RESET)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting another OTP");
        }

        // Create OTP for password reset
        Otp otp = otpService.createOtp(email, OtpType.PASSWORD_RESET);

        // Send password reset OTP email
        try {
            emailService.sendPasswordResetOTP(email, otp.getOtpCode(), user.getName());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to send OTP email. Please try again.");
        }

        return new String[] {
            "Password reset OTP sent to your email. Please verify within 1 minute.",
            otp.getOtpCode()
        };
    }

    @Transactional
    public String requestPasswordReset(String email) {
        return requestPasswordResetWithOtp(email)[0];
    }

    /**
     * FORGOT PASSWORD STEP 2: Verify OTP and reset password
     */
    @Transactional
    public String resetPassword(String email, String otp, String newPassword) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        User user = userOpt.get();

        // Verify OTP
        Optional<Otp> otpOpt = otpService.verifyOtp(email, otp, OtpType.PASSWORD_RESET);
        if (otpOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid or expired OTP. Please request a new one.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.markPasswordReset();
        userRepository.save(user);

        // Clean up used OTP
        otpService.cleanupOtps(email, OtpType.PASSWORD_RESET);

        return "Password reset successfully. You can now login with your new password.";
    }

    /**
     * Resend OTP for password reset
     */
    @Transactional
    public String[] resendPasswordResetOtpWithCode(String email) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, don't reveal if email exists or not
            return new String[] {
                "If an account with this email exists, you will receive a new OTP.",
                ""
            };
        }

        User user = userOpt.get();

        // Check if there was a recent password reset request
        Optional<Otp> existingOtp = otpService.getLatestValidOtp(email, OtpType.PASSWORD_RESET);
        if (existingOtp.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "No pending password reset found. Please start the password reset process again.");
        }

        // Check rate limiting
        if (otpService.isRateLimited(email, OtpType.PASSWORD_RESET)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting another OTP");
        }

        // Delete old OTP to ensure new one is created
        System.out.println("🔄 Deleting old password reset OTP for email: " + email);
        otpService.cleanupOtps(email, OtpType.PASSWORD_RESET);

        // Create new OTP
        Otp newOtp = otpService.createOtp(email, OtpType.PASSWORD_RESET);

        System.out.println("✅ New password reset OTP created: " + newOtp.getOtpCode());

        // Send new OTP email
        try {
            emailService.sendPasswordResetOTP(email, newOtp.getOtpCode(), user.getName());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to send OTP email. Please try again.");
        }

        return new String[] {
            "New password reset OTP sent to your email.",
            newOtp.getOtpCode()
        };
    }

    @Transactional
    public String resendPasswordResetOtp(String email) {
        return resendPasswordResetOtpWithCode(email)[0];
    }

    /**
     * Get latest OTP for an email by type (for testing purposes only)
     */
    public String getLatestOtpForEmail(String email, OtpType type) {
        return otpService.getLatestValidOtp(email, type)
                .map(Otp::getOtpCode)
                .orElse(null);
    }

    /**
     * Get latest OTP for an email (for testing purposes only)
     * Checks both signup and password reset OTPs
     */
    public String getLatestOtpForEmail(String email) {
        // Try to get SIGNUP_VERIFICATION OTP first (most recent context)
        var signupOtp = otpService.getLatestValidOtp(email, OtpType.SIGNUP_VERIFICATION);
        if (signupOtp.isPresent()) {
            return signupOtp.map(Otp::getOtpCode).orElse(null);
        }
        
        // Fall back to PASSWORD_RESET OTP
        return otpService.getLatestValidOtp(email, OtpType.PASSWORD_RESET)
                .map(Otp::getOtpCode)
                .orElse(null);
    }
}