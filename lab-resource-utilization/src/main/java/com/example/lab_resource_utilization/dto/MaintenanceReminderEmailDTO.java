package com.example.lab_resource_utilization.dto;





import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Maintenance Reminder Email Notification
 * Sends reminders to technicians about scheduled maintenance
 */
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

    public MaintenanceReminderEmailDTO() {}

    public MaintenanceReminderEmailDTO(String toEmail, String equipmentName, Long equipmentId, LocalDateTime maintenanceDate, String assignedTechnician, String equipmentStatus, String maintenanceType, String notes) {
        this.toEmail = toEmail;
        this.equipmentName = equipmentName;
        this.equipmentId = equipmentId;
        this.maintenanceDate = maintenanceDate;
        this.assignedTechnician = assignedTechnician;
        this.equipmentStatus = equipmentStatus;
        this.maintenanceType = maintenanceType;
        this.notes = notes;
    }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public LocalDateTime getMaintenanceDate() { return maintenanceDate; }
    public void setMaintenanceDate(LocalDateTime maintenanceDate) { this.maintenanceDate = maintenanceDate; }
    public String getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(String assignedTechnician) { this.assignedTechnician = assignedTechnician; }
    public String getEquipmentStatus() { return equipmentStatus; }
    public void setEquipmentStatus(String equipmentStatus) { this.equipmentStatus = equipmentStatus; }
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
