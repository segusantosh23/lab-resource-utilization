package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Calibration Reminder Email Notification
 * Alerts about upcoming calibration requirements
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalibrationReminderEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Calibration due date is required")
    private LocalDateTime calibrationDueDate;

    @NotNull(message = "Days remaining is required")
    private Integer daysRemaining;

    private String reminderMessage;

    private String calibrationFrequency;
}
