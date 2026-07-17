package com.example.lab_resource_utilization.dto;

public class GroupUtilizationDTO {
    private String groupName;
    private double utilizationRate;
    private double targetRate;

    public GroupUtilizationDTO() {}

    public GroupUtilizationDTO(String groupName, double utilizationRate, double targetRate) {
        this.groupName = groupName;
        this.utilizationRate = utilizationRate;
        this.targetRate = targetRate;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }

    public double getTargetRate() {
        return targetRate;
    }

    public void setTargetRate(double targetRate) {
        this.targetRate = targetRate;
    }
}
