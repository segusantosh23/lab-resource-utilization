package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByUserEmail(String email);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.equipment.id = :equipmentId " +
           "AND b.status IN :activeStatuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean hasOverlappingBooking(
            @Param("equipmentId") Long equipmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("activeStatuses") List<BookingStatus> activeStatuses);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.equipment.id = :equipmentId " +
           "AND b.id != :bookingId " +
           "AND b.status IN :activeStatuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean hasOverlappingBookingExcludingId(
            @Param("equipmentId") Long equipmentId,
            @Param("bookingId") Long bookingId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("activeStatuses") List<BookingStatus> activeStatuses);
    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(DISTINCT b.equipment.id) FROM Booking b WHERE b.status IN :statuses")
    long countDistinctEquipmentByStatuses(@Param("statuses") List<BookingStatus> statuses);
}

