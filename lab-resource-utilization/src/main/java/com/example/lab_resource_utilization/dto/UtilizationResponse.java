package com.example.lab_resource_utilization.dto;

public class UtilizationResponse {

    private long totalEquipment;
    private long availableEquipment;
    private long bookedEquipment;
    private long underMaintenanceEquipment;
    private long totalBookings;
    private double utilizationPercentage;

    public UtilizationResponse() {
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getAvailableEquipment() {
        return availableEquipment;
    }

    public void setAvailableEquipment(long availableEquipment) {
        this.availableEquipment = availableEquipment;
    }

    public long getBookedEquipment() {
        return bookedEquipment;
    }

    public void setBookedEquipment(long bookedEquipment) {
        this.bookedEquipment = bookedEquipment;
    }

    public long getUnderMaintenanceEquipment() {
        return underMaintenanceEquipment;
    }

    public void setUnderMaintenanceEquipment(long underMaintenanceEquipment) {
        this.underMaintenanceEquipment = underMaintenanceEquipment;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }
}