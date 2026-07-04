package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.example.lab_resource_utilization.entity.BookingStatus;
import java.time.LocalDateTime;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByUserEmail(String email);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
