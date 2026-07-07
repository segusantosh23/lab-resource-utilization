package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.entity.Otp;
import com.example.lab_resource_utilization.entity.OtpType;
import com.example.lab_resource_utilization.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a 6-digit OTP
     */
    private String generateOtpCode() {
        int otp = 100000 + secureRandom.nextInt(900000); // 6-digit number
        return String.valueOf(otp);
    }

    /**
     * Create and store a new OTP
     */
    @Transactional
    public Otp createOtp(String email, OtpType type) {
        // Check for recent OTP (prevent spam)
        LocalDateTime cooldownTime = LocalDateTime.now().minusMinutes(1);
        if (otpRepository.existsRecentOtp(email, type, cooldownTime)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Please wait before requesting a new OTP");
        }

        // Check for failed attempts (security measure)
        LocalDateTime hourAgo = LocalDateTime.now().minusHours(1);
        long failedAttempts = otpRepository.countFailedAttempts(email, type, hourAgo);
        if (failedAttempts >= 3) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                "Too many failed attempts. Please try again later");
        }

        // Generate and save new OTP
        String otpCode = generateOtpCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        
        Otp otp = new Otp(email, otpCode, type, expiresAt);
        return otpRepository.save(otp);
    }

    /**
     * Create OTP for signup with pending user data
     */
    @Transactional
    public Otp createSignupOtp(String email, String userName, String userRole, String passwordHash) {
        Otp otp = createOtp(email, OtpType.SIGNUP_VERIFICATION);
        otp.setPendingUserName(userName);
        otp.setPendingUserRole(userRole);
        otp.setPendingPasswordHash(passwordHash);
        return otpRepository.save(otp);
    }

    /**
     * Verify OTP code
     */
    @Transactional
    public Optional<Otp> verifyOtp(String email, String otpCode, OtpType type) {
        Optional<Otp> otpOpt = otpRepository.findByEmailAndOtpCodeAndTypeAndUsedFalse(email, otpCode, type);
        
        if (otpOpt.isEmpty()) {
            return Optional.empty();
        }

        Otp otp = otpOpt.get();
        otp.incrementAttempt();

        if (!otp.isValid()) {
            otpRepository.save(otp);
            return Optional.empty();
        }

        // Mark as used and save
        otp.markAsUsed();
        otpRepository.save(otp);
        
        return Optional.of(otp);
    }

    /**
     * Get the latest valid OTP for an email and type
     */
    public Optional<Otp> getLatestValidOtp(String email, OtpType type) {
        return otpRepository.findLatestValidOtp(email, type, LocalDateTime.now());
    }

    /**
     * Clean up expired OTPs and completed verification data
     */
    @Transactional
    public void cleanupOtps(String email, OtpType type) {
        otpRepository.deleteByEmailAndType(email, type);
    }

    /**
     * Scheduled cleanup of expired OTPs (runs every 10 minutes)
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteExpiredOtps(LocalDateTime.now());
    }

    /**
     * Check if an email is currently rate-limited
     */
    public boolean isRateLimited(String email, OtpType type) {
        LocalDateTime cooldownTime = LocalDateTime.now().minusMinutes(1);
        LocalDateTime hourAgo = LocalDateTime.now().minusHours(1);
        
        boolean hasRecentOtp = otpRepository.existsRecentOtp(email, type, cooldownTime);
        long failedAttempts = otpRepository.countFailedAttempts(email, type, hourAgo);
        
        return hasRecentOtp || failedAttempts >= 3;
    }
}