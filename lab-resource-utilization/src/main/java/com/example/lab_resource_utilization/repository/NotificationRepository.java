package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndTitleAndMessageAndIsReadFalse(Long userId, String title, String message);
}