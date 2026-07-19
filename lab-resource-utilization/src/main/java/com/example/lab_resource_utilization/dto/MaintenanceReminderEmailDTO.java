package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Maintenance Reminder Email Notification
 * Sends reminders to technicians about scheduled maintenance
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceReminderEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Maintenance date is required")
    private LocalDateTime maintenanceDate;

    @NotBlank(message = "Assigned technician is required")
    private String assignedTechnician;

    @NotBlank(message = "Equipment status is required")
    private String equipmentStatus;

    private String maintenanceType;

    private String notes;
}
