package com.example.lab_resource_utilization.dto;

import com.example.lab_resource_utilization.entity.Waitlist;
import java.time.LocalDateTime;

public class WaitlistResponse {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer position;
    private String status;
    private LocalDateTime joinedAt;
    private LocalDateTime notifiedAt;

    public WaitlistResponse() {}

    public static WaitlistResponse from(Waitlist w) {
        WaitlistResponse r = new WaitlistResponse();
        r.setId(w.getId());
        r.setEquipmentId(w.getEquipment().getId());
        r.setEquipmentName(w.getEquipment().getName());
        r.setUserId(w.getUser().getId());
        r.setUserName(w.getUser().getName());
        r.setUserEmail(w.getUser().getEmail());
        r.setPosition(w.getPosition());
        r.setStatus(w.getStatus().name());
        r.setJoinedAt(w.getJoinedAt());
        r.setNotifiedAt(w.getNotifiedAt());
        return r;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; }
}
