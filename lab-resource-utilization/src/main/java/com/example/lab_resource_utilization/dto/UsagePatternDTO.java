package com.example.lab_resource_utilization.dto;

public class UsagePatternDTO {
    private long sharedBookingsCount;
    private long exclusiveBookingsCount;

    public UsagePatternDTO() {}

    public UsagePatternDTO(long sharedBookingsCount, long exclusiveBookingsCount) {
        this.sharedBookingsCount = sharedBookingsCount;
        this.exclusiveBookingsCount = exclusiveBookingsCount;
    }

    public long getSharedBookingsCount() {
        return sharedBookingsCount;
    }

    public void setSharedBookingsCount(long sharedBookingsCount) {
        this.sharedBookingsCount = sharedBookingsCount;
    }

    public long getExclusiveBookingsCount() {
        return exclusiveBookingsCount;
    }

    public void setExclusiveBookingsCount(long exclusiveBookingsCount) {
        this.exclusiveBookingsCount = exclusiveBookingsCount;
    }
}
