package com.example.lab_resource_utilization.dto;

public class IdleEquipmentDTO {
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private long daysIdle;

    public IdleEquipmentDTO() {}

    public IdleEquipmentDTO(Long equipmentId, String equipmentName, String category, long daysIdle) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.daysIdle = daysIdle;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getDaysIdle() {
        return daysIdle;
    }

    public void setDaysIdle(long daysIdle) {
        this.daysIdle = daysIdle;
    }
}
