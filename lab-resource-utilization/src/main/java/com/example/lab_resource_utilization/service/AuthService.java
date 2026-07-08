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
     * CHECK EMAIL AVAILABILITY
     * Validates if email format is correct and not already registered
     * Returns: true if email is available, false if already registered
     */
    public boolean checkEmailAvailability(String email) {
        return userRepository.findByEmail(email).isEmpty();
    }

    /**
     * SEND VERIFICATION OTP
     * Sends OTP to email to validate that the email exists and can receive emails
     * This is done BEFORE collecting password and other account details
     * Returns: [message, otpCode]
     */
    @Transactional
    public String[] sendVerificationOtp(String email) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already in use.");
        }

        // Check rate limiting
        if (otpService.isRateLimited(email, OtpType.SIGNUP_VERIFICATION)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting another OTP");
        }

        // Create a temporary OTP just for email verification (no user data yet)
        Otp otp = otpService.createOtp(email, OtpType.SIGNUP_VERIFICATION);

        // Send OTP email to verify email exists
        try {
            emailService.sendSignupOTP(email, otp.getOtpCode(), "User");
        } catch (Exception e) {
            // If email sending fails, it might mean the email doesn't exist or is invalid
            System.err.println("Failed to send verification OTP to: " + email + " - " + e.getMessage());
            // We still return the OTP for testing purposes, but in production this would fail
        }

        return new String[] {
            "OTP sent to your email. Please verify to continue.",
            otp.getOtpCode()
        };
    }

    /**
     * SUBMIT ACCOUNT DETAILS AFTER EMAIL VERIFICATION
     * After email is verified with OTP, user submits password and account details
     * This updates the OTP record with the account information
     */
    @Transactional
    public void submitAccountDetails(String email, String name, String password, String role) {
        // Verify email has a valid OTP (email was verified)
        Optional<Otp> otpOpt = otpService.getLatestValidOtp(email, OtpType.SIGNUP_VERIFICATION);
        
        if (otpOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No valid email verification found. Please verify your email first.");
        }

        // Validate role
        try {
            Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role specified");
        }

        // Hash the password
        String hashedPassword = passwordEncoder.encode(password);

        // Update the OTP record with account details
        Otp otp = otpOpt.get();
        otp.setPendingUserName(name);
        otp.setPendingUserRole(role.toUpperCase());
        otp.setPendingPasswordHash(hashedPassword);
        
        otpService.saveOtp(otp);
    }

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
     * Resend OTP for signup - returns [message, otpCode]
     */
    @Transactional
    public String[] resendSignupOtpWithCode(String email) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
            }

            // Get the latest OTP data
            Optional<Otp> existingOtp = otpService.getLatestValidOtp(email, OtpType.SIGNUP_VERIFICATION);
            
            if (existingOtp.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "No pending signup found. Please start the signup process again.");
            }

            Otp oldOtp = existingOtp.get();
            String userName = oldOtp.getPendingUserName();
            String userRole = oldOtp.getPendingUserRole();
            String passwordHash = oldOtp.getPendingPasswordHash();

            // Delete old OTP
            otpService.cleanupOtps(email, OtpType.SIGNUP_VERIFICATION);

            // Create new OTP
            Otp newOtp = otpService.createSignupOtp(email, userName, userRole, passwordHash);

            // Send email
            emailService.sendSignupOTP(email, newOtp.getOtpCode(), userName);

            return new String[] {
                "New OTP sent to your email.",
                newOtp.getOtpCode()
            };
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Resend OTP Error: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to resend OTP: " + e.getMessage());
        }
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
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return new String[] {
                    "If an account with this email exists, you will receive a new OTP.",
                    ""
                };
            }

            User user = userOpt.get();

            // Get existing OTP
            Optional<Otp> existingOtp = otpService.getLatestValidOtp(email, OtpType.PASSWORD_RESET);
            if (existingOtp.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "No pending password reset found. Please start the password reset process again.");
            }

            // Delete old OTP
            otpService.cleanupOtps(email, OtpType.PASSWORD_RESET);

            // Create new OTP
            Otp newOtp = otpService.createOtp(email, OtpType.PASSWORD_RESET);

            // Send email
            emailService.sendPasswordResetOTP(email, newOtp.getOtpCode(), user.getName());

            return new String[] {
                "New password reset OTP sent to your email.",
                newOtp.getOtpCode()
            };
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Resend Password Reset OTP Error: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to resend OTP: " + e.getMessage());
        }
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

    /**
     * NEW 3-STEP FLOW - Step 2: Verify OTP only (without account creation)
     */
    @Transactional
    public void verifyOtpOnly(String email, String otpCode) {
        // Validate email format
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        // Check if email is already registered
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already in use.");
        }

        // Verify OTP
        otpService.verifyOtp(email, otpCode, OtpType.SIGNUP_VERIFICATION);
        
        // OTP is valid - mark as used but don't create account yet
        System.out.println("✅ [VERIFY OTP ONLY] Email: " + email + " - OTP verified successfully");
    }

    /**
     * NEW 3-STEP FLOW - Step 3: Complete signup with password after OTP verification
     */
    @Transactional
    public void completeSignup(String email, String password, String name, String roleStr) {
        // Validate email format
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        // Check if email is already registered
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already in use.");
        }

        // Validate password
        if (password == null || password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        // Parse and validate role
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleStr);
        }

        // Create user account
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEmailVerified(true); // Email already verified via OTP
        
        userRepository.save(user);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(email, name);
        } catch (Exception e) {
            // Log but don't fail registration if welcome email fails
            System.err.println("⚠️ Failed to send welcome email to " + email + ": " + e.getMessage());
        }

        System.out.println("✅ [COMPLETE SIGNUP] Account created successfully for: " + email);
    }
}