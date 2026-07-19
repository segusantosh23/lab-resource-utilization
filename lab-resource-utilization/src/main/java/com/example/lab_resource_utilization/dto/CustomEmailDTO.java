package com.example.lab_resource_utilization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for sending custom email notifications
 * Provides flexibility for ad-hoc email communications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private boolean isHtml = false;
}
