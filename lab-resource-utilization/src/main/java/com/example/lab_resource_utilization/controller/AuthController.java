package com.example.lab_resource_utilization.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.lab_resource_utilization.dto.LoginRequest;
import com.example.lab_resource_utilization.dto.RegisterRequest;
import com.example.lab_resource_utilization.dto.SignupRequest;
import com.example.lab_resource_utilization.dto.VerifyOtpRequest;
import com.example.lab_resource_utilization.dto.VerifyOtpOnlyRequest;
import com.example.lab_resource_utilization.dto.CompleteSignupRequest;
import com.example.lab_resource_utilization.dto.ResendOtpRequest;
import com.example.lab_resource_utilization.dto.ForgotPasswordRequest;
import com.example.lab_resource_utilization.dto.ResetPasswordRequest;
import com.example.lab_resource_utilization.dto.LoginResponse;
import com.example.lab_resource_utilization.service.AuthService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * OLD ENDPOINT - kept for backward compatibility
     * Direct registration without OTP
     */
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * CHECK EMAIL AVAILABILITY
     * POST /auth/check-email
     * Body: { "email": "john@example.com" }
     * Response: { "available": true/false, "message": "..." }
     */
    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@Valid @RequestBody com.example.lab_resource_utilization.dto.CheckEmailRequest request) {
        boolean isAvailable = authService.checkEmailAvailability(request.getEmail());
        
        Map<String, Object> response = new HashMap<>();
        response.put("available", isAvailable);
        
        if (!isAvailable) {
            response.put("message", "This email is already in use.");
        } else {
            response.put("message", "Email is available.");
        }
        
        System.out.println("📧 [CHECK EMAIL] Email: " + request.getEmail() + " | Available: " + isAvailable);
        return ResponseEntity.ok(response);
    }

    /**
     * SEND VERIFICATION OTP - NEW FLOW STEP 1
     * Sends OTP to email to validate that the email exists (before collecting account details)
     * POST /auth/send-verification-otp
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/send-verification-otp")
    public ResponseEntity<Map<String, Object>> sendVerificationOtp(@Valid @RequestBody com.example.lab_resource_utilization.dto.SendVerificationOtpRequest request) {
        String[] result = authService.sendVerificationOtp(request.getEmail());
        String message = result[0];
        String otpCode = result[1];
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("email", request.getEmail());
        
        System.out.println("✅ [SEND VERIFICATION OTP] Email: " + request.getEmail() + " | OTP: " + otpCode);
        return ResponseEntity.ok(response);
    }

    /**
     * SUBMIT ACCOUNT DETAILS - NEW FLOW STEP 2
     * After email is verified with OTP, submit account details
     * POST /auth/submit-account-details
     * Body: { "email": "john@example.com", "name": "John", "password": "Pass@123", "role": "RESEARCHER" }
     */
    @PostMapping("/submit-account-details")
    public ResponseEntity<Map<String, String>> submitAccountDetails(@Valid @RequestBody SignupRequest request) {
        authService.submitAccountDetails(request.getEmail(), request.getName(), request.getPassword(), request.getRole());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account details saved. Please verify OTP to complete registration.");
        
        System.out.println("✅ [SUBMIT ACCOUNT DETAILS] Email: " + request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * NEW SIGNUP FLOW - Step 1: Initiate signup and send OTP
     * POST /auth/signup
     * Body: { "name": "John", "email": "john@example.com", "password": "Pass@123", "role": "RESEARCHER" }
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        String[] result = authService.initiateSignupWithOtp(request);
        String message = result[0];
        String otpCode = result[1];
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("email", request.getEmail());
        
        System.out.println("✅ OTP added to response directly: " + otpCode);
        System.out.println("📤 Final Response: " + response);
        return ResponseEntity.ok(response);
    }

    /**
     * NEW SIGNUP FLOW - Step 2: Verify OTP and complete registration
     * POST /auth/signup/verify
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
@PostMapping("/signup/verify")
public ResponseEntity<?> verifySignupOtp(@Valid @RequestBody VerifyOtpRequest request) {
    LoginResponse response = authService.verifySignupOtp(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
    /**
     * Resend OTP for signup verification
     * POST /auth/signup/resend
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/signup/resend")
    public ResponseEntity<Map<String, Object>> resendSignupOtp(@Valid @RequestBody ResendOtpRequest request) {
        String[] result = authService.resendSignupOtpWithCode(request.getEmail());
        String message = result[0];
        String otpCode = result[1];
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
    
        
        return ResponseEntity.ok(response);
    }

    /**
     * LOGIN
     * POST /auth/login
     * Body: { "email": "john@example.com", "password": "Pass@123" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        if (response.getToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * FORGOT PASSWORD FLOW - Step 1: Request password reset OTP
     * POST /auth/forgot-password
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        System.out.println("🔵 [FORGOT PASSWORD] Request received for email: " + request.getEmail());
        String[] result = authService.requestPasswordResetWithOtp(request.getEmail());
        String message = result[0];
        String otpCode = result[1];
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("email", request.getEmail());
        
        // Only include OTP if it was generated (user exists)
        if (!otpCode.isEmpty()) {
           
            
            System.out.println("✅ [FORGOT PASSWORD] OTP generated: " + otpCode + " for email: " + request.getEmail());
        } else {
            System.out.println("⚠️ [FORGOT PASSWORD] No OTP for email (user might not exist): " + request.getEmail());
        }
        
        System.out.println("📤 [FORGOT PASSWORD] Response: " + response);
        return ResponseEntity.ok(response);
    }

    /**
     * FORGOT PASSWORD FLOW - Step 2: Reset password with OTP
     * POST /auth/reset-password
     * Body: { "email": "john@example.com", "otp": "123456", "newPassword": "NewPass@123" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Resend OTP for password reset
     * POST /auth/forgot-password/resend
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/forgot-password/resend")
    public ResponseEntity<Map<String, Object>> resendPasswordResetOtp(@Valid @RequestBody ResendOtpRequest request) {
        String[] result = authService.resendPasswordResetOtpWithCode(request.getEmail());
        String message = result[0];
        String otpCode = result[1];
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * FORGOT PASSWORD FLOW - Verify OTP before allowing password reset
     * POST /auth/forgot-password/verify
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<Map<String, String>> verifyForgotPasswordOtp(@Valid @RequestBody VerifyOtpOnlyRequest request) {
        authService.checkPasswordResetOtp(request.getEmail(), request.getOtp());
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP verified successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * NEW 3-STEP FLOW - Step 2: Verify OTP only (without account creation)
     * POST /auth/verify-otp-only
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
    @PostMapping("/verify-otp-only")
    
    public ResponseEntity<Map<String, String>> verifyOtpOnly(@Valid @RequestBody VerifyOtpOnlyRequest request) {
        // This method will throw exception automatically if OTP is wrong
        authService.verifyOtpOnly(request.getEmail(), request.getOtp());

        Map<String, String> response = new HashMap<>();
        response.put("email", request.getEmail());
        response.put("message", "Email verified successfully");

        return ResponseEntity.ok(response);

    }


    /**
     * NEW 3-STEP FLOW - Step 3: Complete signup with password after OTP verification
     * POST /auth/signup/complete
     * Body: { "email": "john@example.com", "password": "Pass@123", "name": "John", "role": "RESEARCHER" }
     */
    @PostMapping("/signup/complete")
    public ResponseEntity<Map<String, String>> completeSignup(@Valid @RequestBody CompleteSignupRequest request) {
        authService.completeSignup(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account created successfully");
        response.put("email", request.getEmail());
        response.put("name", request.getName());
        
        System.out.println("✅ [COMPLETE SIGNUP] Email: " + request.getEmail() + " - Account created");
        return ResponseEntity.ok(response);
    }
}
