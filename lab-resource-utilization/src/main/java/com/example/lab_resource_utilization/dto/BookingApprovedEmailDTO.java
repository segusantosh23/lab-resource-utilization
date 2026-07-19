package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for Booking Approved Email Notification
 * Contains all necessary details for sending booking approval emails
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
