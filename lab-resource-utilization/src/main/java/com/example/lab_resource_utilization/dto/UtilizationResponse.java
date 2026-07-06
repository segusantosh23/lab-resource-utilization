package com.example.lab_resource_utilization.dto;

public class UtilizationResponse {

    // Equipment counts
    private long totalEquipment;
    private long availableEquipment;
    private long bookedEquipment;
    private long underMaintenanceEquipment;
    private long outOfServiceEquipment;
    private long retiredEquipment;

    // Booking counts
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long inUseBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long rejectedBookings;

    // Rates
    private double utilizationPercentage;   // (CONFIRMED + IN_USE) / totalEquipment * 100
    private double completionRate;           // COMPLETED / (COMPLETED + CANCELLED + REJECTED) * 100
    private double approvalRate;             // CONFIRMED / (CONFIRMED + REJECTED) * 100

    // Waitlist
    private long waitlistCount;

    public UtilizationResponse() {}

    // ── Getters & Setters ──────────────────────────────────────────

    public long getTotalEquipment() { return totalEquipment; }
    public void setTotalEquipment(long v) { this.totalEquipment = v; }

    public long getAvailableEquipment() { return availableEquipment; }
    public void setAvailableEquipment(long v) { this.availableEquipment = v; }

    public long getBookedEquipment() { return bookedEquipment; }
    public void setBookedEquipment(long v) { this.bookedEquipment = v; }

    public long getUnderMaintenanceEquipment() { return underMaintenanceEquipment; }
    public void setUnderMaintenanceEquipment(long v) { this.underMaintenanceEquipment = v; }

    public long getOutOfServiceEquipment() { return outOfServiceEquipment; }
    public void setOutOfServiceEquipment(long v) { this.outOfServiceEquipment = v; }

    public long getRetiredEquipment() { return retiredEquipment; }
    public void setRetiredEquipment(long v) { this.retiredEquipment = v; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long v) { this.totalBookings = v; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long v) { this.pendingBookings = v; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long v) { this.confirmedBookings = v; }

    public long getInUseBookings() { return inUseBookings; }
    public void setInUseBookings(long v) { this.inUseBookings = v; }

    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long v) { this.completedBookings = v; }

    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long v) { this.cancelledBookings = v; }

    public long getRejectedBookings() { return rejectedBookings; }
    public void setRejectedBookings(long v) { this.rejectedBookings = v; }

    public double getUtilizationPercentage() { return utilizationPercentage; }
    public void setUtilizationPercentage(double v) { this.utilizationPercentage = v; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double v) { this.completionRate = v; }

    public double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(double v) { this.approvalRate = v; }

    public long getWaitlistCount() { return waitlistCount; }
    public void setWaitlistCount(long v) { this.waitlistCount = v; }
}
