package com.example.lab_resource_utilization.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_audit_log")
public class BookingAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "changed_by_email", nullable = false)
    private String changedByEmail;

    @Column(name = "changed_by_name")
    private String changedByName;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private BookingStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private BookingStatus newStatus;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(name = "notes", length = 500)
    private String notes;

    public BookingAuditLog() {
    }

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public String getChangedByEmail() { return changedByEmail; }
    public void setChangedByEmail(String changedByEmail) { this.changedByEmail = changedByEmail; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public BookingStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(BookingStatus oldStatus) { this.oldStatus = oldStatus; }

    public BookingStatus getNewStatus() { return newStatus; }
    public void setNewStatus(BookingStatus newStatus) { this.newStatus = newStatus; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
