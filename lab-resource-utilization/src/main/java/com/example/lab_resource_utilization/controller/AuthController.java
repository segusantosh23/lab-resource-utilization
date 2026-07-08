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
        response.put("otp_for_testing", otpCode); // Direct from creation, no database query needed!
        response.put("note", "⚠️ OTP shown for testing purposes only. In production, OTP will be sent via email.");
        
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
    public ResponseEntity<LoginResponse> verifySignupOtp(@Valid @RequestBody VerifyOtpRequest request) {
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
        response.put("otp_for_testing", otpCode); // Direct from creation!
        
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
            response.put("otp_for_testing", otpCode); // Direct from creation!
            response.put("note", "⚠️ OTP shown for testing purposes only. In production, OTP will be sent via email.");
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
        
        // Only include OTP if it was generated
        if (!otpCode.isEmpty()) {
            response.put("otp_for_testing", otpCode); // Direct from creation!
        }
        
        return ResponseEntity.ok(response);
    }
}
