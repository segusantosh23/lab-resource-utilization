package com.example.lab_resource_utilization.dto;






import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Booking Rejected Email Notification
 * Contains details about rejected booking and rejection reason
 */
public class BookingRejectedEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    private String bookingDate;

    private String bookingTime;

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;

    private String contactEmail;

    private String contactPhone;

    public BookingRejectedEmailDTO() {}

    public BookingRejectedEmailDTO(String toEmail, String userName, String equipmentName, String bookingDate, String bookingTime, String rejectionReason, String contactEmail, String contactPhone) {
        this.toEmail = toEmail;
        this.userName = userName;
        this.equipmentName = equipmentName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.rejectionReason = rejectionReason;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
    }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }
    public String getBookingTime() { return bookingTime; }
    public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
