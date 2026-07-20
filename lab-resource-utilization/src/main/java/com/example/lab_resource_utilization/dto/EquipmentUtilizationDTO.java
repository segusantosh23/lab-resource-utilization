package com.example.lab_resource_utilization.dto;

public class EquipmentUtilizationDTO {
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private double utilizationRate;
    private double bookedHours;
    private double capacityHours;

    public EquipmentUtilizationDTO() {}

    public EquipmentUtilizationDTO(Long equipmentId, String equipmentName, String category, double utilizationRate, double bookedHours, double capacityHours) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.utilizationRate = utilizationRate;
        this.bookedHours = bookedHours;
        this.capacityHours = capacityHours;
    }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getUtilizationRate() { return utilizationRate; }
    public void setUtilizationRate(double utilizationRate) { this.utilizationRate = utilizationRate; }

    public double getBookedHours() { return bookedHours; }
    public void setBookedHours(double bookedHours) { this.bookedHours = bookedHours; }

    public double getCapacityHours() { return capacityHours; }
    public void setCapacityHours(double capacityHours) { this.capacityHours = capacityHours; }
}
