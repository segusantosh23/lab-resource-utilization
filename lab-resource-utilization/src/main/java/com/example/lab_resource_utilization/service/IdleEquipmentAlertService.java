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


    // Runs every day at midnight
   @Scheduled(fixedRate = 60000)
    public void checkForIdleEquipment() {

        // Get all lab managers
        List<User> managers = userRepository.findByRole(Role.LAB_MANAGER);


        // Check each manager's department equipment
        for (User manager : managers) {


            List<IdleEquipmentDTO> idleEquipment =
                    analyticsService.getIdleEquipment(manager.getEmail());


            if (idleEquipment.isEmpty()) {
                continue;
            }


            for (IdleEquipmentDTO dto : idleEquipment) {

                String title = "Idle Equipment Alert";


                String message =
                        "Equipment " 
                        + dto.getEquipmentName()
                        + " (ID: "
                        + dto.getEquipmentId()
                        + ") has been idle for "
                        + dto.getDaysIdle()
                        + " days. Consider reviewing its status.";


                notificationService.createNotification(
                        manager,
                        title,
                        message,
                        "WARNING"
                );
            }
        }
    }
}