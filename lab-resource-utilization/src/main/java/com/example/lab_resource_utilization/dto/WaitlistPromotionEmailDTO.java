package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Waitlist Promotion Email Notification
 * Notifies users when automatically promoted from waitlist to confirmed booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
