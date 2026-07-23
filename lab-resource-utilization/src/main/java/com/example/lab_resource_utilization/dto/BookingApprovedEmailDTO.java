package com.example.lab_resource_utilization.dto;






import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Booking Approved Email Notification
 * Contains all necessary details for sending booking approval emails
 */
public class BookingApprovedEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    private String equipmentId;

    private String bookingDate;

    private String bookingTime;

    private String labName;

    private String department;

    @NotBlank(message = "Booking status is required")
    private String bookingStatus;

    private String purpose;

    public BookingApprovedEmailDTO() {}

    public BookingApprovedEmailDTO(String toEmail, String userName, String equipmentName, String equipmentId, String bookingDate, String bookingTime, String labName, String department, String bookingStatus, String purpose) {
        this.toEmail = toEmail;
        this.userName = userName;
        this.equipmentName = equipmentName;
        this.equipmentId = equipmentId;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.labName = labName;
        this.department = department;
        this.bookingStatus = bookingStatus;
        this.purpose = purpose;
    }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }
    public String getBookingTime() { return bookingTime; }
    public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
    public String getLabName() { return labName; }
    public void setLabName(String labName) { this.labName = labName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
