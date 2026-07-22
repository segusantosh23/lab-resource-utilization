package com.example.lab_resource_utilization.dto;






import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Waitlist Promotion Email Notification
 * Notifies users when automatically promoted from waitlist to confirmed booking
 */
public class WaitlistPromotionEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    private String bookingDate;

    private String bookingTime;

    @NotBlank(message = "New booking status is required")
    private String newBookingStatus;

    private String confirmationMessage;

    public WaitlistPromotionEmailDTO() {}

    public WaitlistPromotionEmailDTO(String toEmail, String userName, String equipmentName, String bookingDate, String bookingTime, String newBookingStatus, String confirmationMessage) {
        this.toEmail = toEmail;
        this.userName = userName;
        this.equipmentName = equipmentName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.newBookingStatus = newBookingStatus;
        this.confirmationMessage = confirmationMessage;
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
    public String getNewBookingStatus() { return newBookingStatus; }
    public void setNewBookingStatus(String newBookingStatus) { this.newBookingStatus = newBookingStatus; }
    public String getConfirmationMessage() { return confirmationMessage; }
    public void setConfirmationMessage(String confirmationMessage) { this.confirmationMessage = confirmationMessage; }
}
