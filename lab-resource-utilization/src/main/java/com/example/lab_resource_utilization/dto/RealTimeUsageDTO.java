package com.example.lab_resource_utilization.dto;

import java.time.LocalDateTime;

public class RealTimeUsageDTO {
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private String status;
    private String currentUserName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Constructors
    public RealTimeUsageDTO() {}

    public RealTimeUsageDTO(Long equipmentId, String equipmentName, String category, String status, String currentUserName, LocalDateTime startTime, LocalDateTime endTime) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.status = status;
        this.currentUserName = currentUserName;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentUserName() { return currentUserName; }
    public void setCurrentUserName(String currentUserName) { this.currentUserName = currentUserName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}
