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

    Optional<Otp> findTopByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(
        String email,
        OtpType type
    );

    Optional<Otp> findTopByEmailAndOtpCodeAndTypeOrderByCreatedAtDesc(
        String email,
        String otpCode,
        OtpType type
    );

    Optional<Otp> findByEmailAndOtpCodeAndTypeAndUsedFalse(
        String email,
        String otpCode,
        OtpType type
    );

    @Query("SELECT COUNT(o) > 0 FROM Otp o WHERE o.email = :email AND o.type = :type AND o.createdAt > :since")
    boolean existsRecentOtp(
        @Param("email") String email,
        @Param("type") OtpType type,
        @Param("since") LocalDateTime since
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    void deleteByEmailAndType(String email, OtpType type);

    @Query("SELECT COUNT(o) FROM Otp o WHERE o.email = :email AND o.type = :type AND o.attemptCount >= 3 AND o.createdAt > :since")
    long countFailedAttempts(
        @Param("email") String email,
        @Param("type") OtpType type,
        @Param("since") LocalDateTime since
    );
}