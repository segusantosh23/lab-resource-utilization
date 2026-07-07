package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.NotificationResponse;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my")
    public List<NotificationResponse> getMyNotifications(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationService.getMyNotifications(user.getId());

    }

    @PutMapping("/{id}/read")
    public String markAsRead(@PathVariable Long id,
                             Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        notificationService.markAsRead(id, user.getId());

        return "Notification marked as read";

    }
    @PutMapping("/read-all")
    public String markAllAsRead(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        notificationService.markAllAsRead(user.getId());

        return "All notifications marked as read";

    }

}