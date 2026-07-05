package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.BookingAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingAuditLogRepository extends JpaRepository<BookingAuditLog, Long> {

    List<BookingAuditLog> findByBookingIdOrderByChangedAtAsc(Long bookingId);

    List<BookingAuditLog> findAllByOrderByChangedAtDesc();
}
