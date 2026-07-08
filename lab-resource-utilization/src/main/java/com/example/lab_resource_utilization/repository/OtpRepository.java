package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Otp;
import com.example.lab_resource_utilization.entity.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    /**
     * Find the most recent valid OTP for a given email and type (no expiry check)
     */
    @Query("SELECT o FROM Otp o WHERE o.email = :email AND o.type = :type AND o.used = false ORDER BY o.createdAt DESC LIMIT 1")
    Optional<Otp> findLatestValidOtp(@Param("email") String email, @Param("type") OtpType type);

    /**
     * Find OTP by email, code, and type (for verification)
     */
    Optional<Otp> findByEmailAndOtpCodeAndTypeAndUsedFalse(String email, String otpCode, OtpType type);

    /**
     * Check if there's a recent OTP (within cooldown period) for the same email and type
     */
    @Query("SELECT COUNT(o) > 0 FROM Otp o WHERE o.email = :email AND o.type = :type AND o.createdAt > :since")
    boolean existsRecentOtp(@Param("email") String email, @Param("type") OtpType type, @Param("since") LocalDateTime since);

    /**
     * Delete expired OTPs (cleanup job)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    /**
     * Delete all OTPs for a specific email and type (when user completes verification)
     */
    @Modifying
    @Transactional
    void deleteByEmailAndType(String email, OtpType type);

    /**
     * Count failed attempts for an email within a time window
     */
    @Query("SELECT COUNT(o) FROM Otp o WHERE o.email = :email AND o.type = :type AND o.attemptCount >= 3 AND o.createdAt > :since")
    long countFailedAttempts(@Param("email") String email, @Param("type") OtpType type, @Param("since") LocalDateTime since);
}