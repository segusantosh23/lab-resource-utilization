package com.example.lab_resource_utilization.dto;





import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for sending custom email notifications
 * Provides flexibility for ad-hoc email communications
 */
public class CustomEmailDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private boolean isHtml = false;

    public CustomEmailDTO() {}

    public CustomEmailDTO(String toEmail, String subject, String message) {
        this.toEmail = toEmail;
        this.subject = subject;
        this.message = message;
    }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isHtml() { return isHtml; }
}
