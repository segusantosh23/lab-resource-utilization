package com.example.lab_resource_utilization.dto;

import jakarta.validation.constraints.NotNull;

public class WaitlistRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
}
