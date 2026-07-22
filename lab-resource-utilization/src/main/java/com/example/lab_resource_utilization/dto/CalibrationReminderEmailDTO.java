package com.example.lab_resource_utilization.dto;





import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Calibration Reminder Email Notification
 * Alerts about upcoming calibration requirements
 */
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

    public CalibrationReminderEmailDTO() {}

    public CalibrationReminderEmailDTO(String toEmail, String equipmentName, Long equipmentId, LocalDateTime calibrationDueDate, Integer daysRemaining, String reminderMessage, String calibrationFrequency) {
        this.toEmail = toEmail;
        this.equipmentName = equipmentName;
        this.equipmentId = equipmentId;
        this.calibrationDueDate = calibrationDueDate;
        this.daysRemaining = daysRemaining;
        this.reminderMessage = reminderMessage;
        this.calibrationFrequency = calibrationFrequency;
    }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public LocalDateTime getCalibrationDueDate() { return calibrationDueDate; }
    public void setCalibrationDueDate(LocalDateTime calibrationDueDate) { this.calibrationDueDate = calibrationDueDate; }
    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }
    public String getReminderMessage() { return reminderMessage; }
    public void setReminderMessage(String reminderMessage) { this.reminderMessage = reminderMessage; }
    public String getCalibrationFrequency() { return calibrationFrequency; }
    public void setCalibrationFrequency(String calibrationFrequency) { this.calibrationFrequency = calibrationFrequency; }
}
