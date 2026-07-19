package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Booking Rejected Email Notification
 * Contains details about rejected booking and rejection reason
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
