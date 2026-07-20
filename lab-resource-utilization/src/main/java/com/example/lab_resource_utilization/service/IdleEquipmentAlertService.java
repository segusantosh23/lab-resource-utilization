package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.IdleEquipmentDTO;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IdleEquipmentAlertService {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    // Run once a day at midnight (0 0 0 * * ?) or for testing every hour or so. We'll set it to run daily.
    // However, to make it observable, we'll just use a daily cron.
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkForIdleEquipment() {
        List<IdleEquipmentDTO> idleEquipment = analyticsService.getIdleEquipment();

        if (idleEquipment.isEmpty()) {
            return;
        }

        List<User> managers = userRepository.findByRole(Role.LAB_MANAGER);

        for (IdleEquipmentDTO dto : idleEquipment) {
            String title = "Idle Equipment Alert";
            String message = "Equipment '" + dto.getEquipmentName() + "' (ID: " + dto.getEquipmentId() + 
                             ") has been idle for " + dto.getDaysIdle() + " days. Consider reviewing its status.";
            
            for (User manager : managers) {
                notificationService.createNotification(manager, title, message, "WARNING");
            }
        }
    }
}
