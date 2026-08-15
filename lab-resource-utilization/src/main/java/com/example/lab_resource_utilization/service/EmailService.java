package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;

/**
 * Production-ready SMTP Email Notification Service
 * Handles all email notifications for the Lab Resource Utilization Platform
 * 
 * Features:
 * - Booking notifications (approved, rejected)
 * - Maintenance reminders
 * - Calibration alerts
 * - Waitlist promotions
 * - Custom email sending
 * - Professional HTML templates
 * - Comprehensive error handling
 * - Detailed logging
 * 
 * @author Lab Resource Utilization Team
 * @version 2.0
 */
@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.name}")
    private String appName;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.support-email}")
    private String supportEmail;

    /**
     * Send Signup OTP Email
     * Sends OTP verification email to user during signup
     * @throws RuntimeException if email sending fails
     */
    @Async
    public void sendSignupOTP(String toEmail, String otp, String userName) {
        logger.info("📧 [SEND VERIFICATION OTP] Attempting to send OTP to: " + toEmail);
        String cleanSender = (senderEmail != null && !senderEmail.isBlank()) ? senderEmail.trim() : "santhuconnected@gmail.com";
        String htmlContent = buildSignupOTPEmail(userName, otp);
        String subject = "Email Verification - " + appName;
        
        try {
            logger.info("🔧 [SMTP CONFIG] Sender configured, preparing message");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setFrom(cleanSender, appName);
            helper.setText(htmlContent, true);

            logger.info("📤 [SMTP SEND] Connecting to SMTP server and sending email...");
            mailSender.send(message);
            
            logger.info("✅ [SEND VERIFICATION OTP] Email sent successfully via SMTP to: " + toEmail);
            return;
            
        } catch (Exception e) {
            logger.warning("⚠️ [SMTP FAILED] " + e.getMessage() + ". Triggering Brevo HTTPS REST API fallback...");
        }

        // HTTPS REST API Fallback
        boolean apiSuccess = sendViaBrevoHttpApi(toEmail, subject, htmlContent);
        if (apiSuccess) {
            logger.info("✅ [SEND VERIFICATION OTP] Email sent successfully via Brevo HTTPS API to: " + toEmail);
        } else {
            logger.severe("❌ [EMAIL ERROR] Failed to send email via both SMTP and Brevo HTTPS API to: " + toEmail);
        }
    }

    private boolean sendViaBrevoHttpApi(String toEmail, String subject, String htmlContent) {
        try {
            String cleanSender = (senderEmail != null && !senderEmail.isBlank()) ? senderEmail.trim() : "santhuconnected@gmail.com";
            String cleanKey = (mailPassword != null && !mailPassword.isBlank()) ? mailPassword.trim() : "";

            if (cleanKey.isEmpty()) {
                logger.severe("❌ [BREVO API ERROR] mailPassword (api-key) is not configured.");
                return false;
            }

            URL url = new URI("https://api.brevo.com/v3/smtp/email").toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("api-key", cleanKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);

            String jsonPayload = String.format(
                "{\"sender\":{\"name\":\"%s\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":\"%s\"}",
                escapeJsonString(appName),
                escapeJsonString(cleanSender),
                escapeJsonString(toEmail),
                escapeJsonString(subject),
                escapeJsonString(htmlContent)
            );

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            if (code >= 200 && code < 300) {
                return true;
            } else {
                String errBody = "";
                if (conn.getErrorStream() != null) {
                    errBody = new String(conn.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                }
                logger.severe("❌ [BREVO API ERROR] HTTP " + code + ": " + errBody);
            }
        } catch (Exception ex) {
            logger.severe("❌ [BREVO API EXCEPTION] " + ex.getMessage());
        }
        return false;
    }

    private String escapeJsonString(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    @Async
    public void sendPasswordResetOTP(String toEmail, String otp, String userName) {
        logger.info("🔐 [PASSWORD RESET OTP] Email: " + toEmail + " | OTP: " + otp + " | User: " + userName);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Password Reset - " + appName + " OTP: " + otp);
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildPasswordResetOTPEmail(userName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Password reset OTP sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Failed to send password reset OTP to: " + toEmail + ". Error: " + e.getMessage());
            logger.warning("⚠️ Continuing without email delivery so password reset can still proceed in development.");
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        logger.info("🎉 [WELCOME EMAIL] Sent to: " + toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + appName + "!");
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildWelcomeEmail(userName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Welcome email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Failed to send welcome email to: " + toEmail + ". Error: " + e.getMessage());
            // Don't throw - registration already completed
        }
    }

    @Async
    public void sendWaitlistNotification(String toEmail, String userName, String equipmentName) {
        logger.info("⏳ [WAITLIST NOTIFICATION EMAIL] Sent to: " + toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Equipment Available - " + equipmentName);
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildWaitlistNotificationEmail(userName, equipmentName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Waitlist notification email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Failed to send waitlist notification email to: " + toEmail + ". Error: " + e.getMessage());
        }
    }

    private String buildSignupOTPEmail(String userName, String otp) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #a855f7; margin: 0; font-size: 28px;'>🔐 Email Verification</h1>" +
               "</div>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Thank you for signing up! Please use the following OTP to verify your email address:</p>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<div style='display: inline-block; background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 20px 40px; border-radius: 12px; margin: 20px 0;'>" +
               "<span style='color: white; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace;'>" + otp + "</span>" +
               "</div></div>" +
               "<div style='background: #ef4444; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 16px; font-weight: bold;'>⏰ This OTP is valid for 30 seconds only</p>" +
               "</div>" +
               "<div style='background: #dc2626; color: #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>🔒 Security Notice:</strong> Do not share this OTP with anyone. Our team will never ask for your OTP.</p>" +
               "</div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    private String buildPasswordResetOTPEmail(String userName, String otp) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #f59e0b; margin: 0; font-size: 28px;'>🔑 Password Reset</h1>" +
               "</div>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>We received a request to reset your password. Use this OTP to proceed:</p>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<div style='display: inline-block; background: linear-gradient(135deg, #ea580c, #f59e0b); padding: 20px 40px; border-radius: 12px;'>" +
               "<span style='color: white; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace;'>" + otp + "</span>" +
               "</div></div>" +
               "<div style='background: #991b1b; color: #fca5a5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 16px; font-weight: bold;'>⏰ This OTP expires in 1 minute!</p>" +
               "</div>" +
               "<div style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>🔒 Security Note:</strong> If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>" +
               "</div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    private String buildWelcomeEmail(String userName) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #10b981; margin: 0; font-size: 28px;'>🎉 Welcome!</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Welcome " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Your account on " + appName + " has been successfully created!</p>" +
               "<div style='background: #064e3b; border: 2px solid #10b981; color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;'>" +
               "<h3 style='color: #6ee7b7; margin-top: 0; font-size: 18px;'>🚀 What you can do now:</h3>" +
               "<ul style='margin: 15px 0; padding-left: 20px;'>" +
               "<li style='margin-bottom: 8px;'>🔬 Browse and book laboratory equipment</li>" +
               "<li style='margin-bottom: 8px;'>📅 View real-time availability calendars</li>" +
               "<li style='margin-bottom: 8px;'>⏳ Join waitlists for high-demand equipment</li>" +
               "<li style='margin-bottom: 8px;'>📊 Track your booking history</li>" +
               "<li style='margin-bottom: 8px;'>🔔 Receive notifications about your reservations</li></ul>" +
               "</div>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "' style='display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "🎯 Get Started Now</a></div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    private String buildWaitlistNotificationEmail(String userName, String equipmentName) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #3b82f6; margin: 0; font-size: 28px;'>⏳ Equipment Available!</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(userName) + ",</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Good news! The equipment <strong>" + escapeHtml(equipmentName) + "</strong> you were waitlisted for is now available to book.</p>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/bookings' style='display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "📅 Book Now</a></div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }

    // ========================================
    // WEEK 3: SMTP EMAIL NOTIFICATION METHODS
    // ========================================

    /**
     * Send Booking Approved Email
     * Notifies user when their booking request has been approved
     */
    @Async
    public void sendBookingApprovedEmail(BookingApprovedEmailDTO dto) {
        logger.info("📧 [BOOKING APPROVED EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), "Booking Approved", "booking approved notification");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject("✅ Booking Approved - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildBookingApprovedEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Booking approved email sent successfully to: " + dto.getToEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Time: " + LocalDateTime.now());
        } catch (MailAuthenticationException e) {
            logger.severe("🔐 Mail authentication failed for booking approved email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Email authentication failed. Please check SMTP credentials.", e);
        } catch (MailSendException e) {
            logger.severe("📧 Failed to send booking approved email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send email. Please check recipient address.", e);
        } catch (MessagingException e) {
            logger.severe("⚠️ Messaging error while sending booking approved email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Error preparing email message.", e);
        } catch (Exception e) {
            logger.severe("❌ Unexpected error sending booking approved email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Unexpected error occurred while sending email.", e);
        }
    }

    /**
     * Send Booking Rejected Email
     * Notifies user when their booking request has been rejected
     */
    @Async
    public void sendBookingRejectedEmail(BookingRejectedEmailDTO dto) {
        logger.info("📧 [BOOKING REJECTED EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), "Booking Rejected", "booking rejected notification");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject("❌ Booking Rejected - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildBookingRejectedEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Booking rejected email sent successfully to: " + dto.getToEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send booking rejected email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send booking rejected email.", e);
        }
    }

    /**
     * Send Maintenance Reminder Email
     * Alerts technicians about upcoming/scheduled maintenance
     */
    @Async
    public void sendMaintenanceReminderEmail(MaintenanceReminderEmailDTO dto) {
        logger.info("🔧 [MAINTENANCE REMINDER EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), "Maintenance Reminder", "maintenance reminder");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject("🔧 Maintenance Reminder - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildMaintenanceReminderEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Maintenance reminder email sent successfully to: " + dto.getToEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Maintenance Date: " + dto.getMaintenanceDate() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send maintenance reminder email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send maintenance reminder email.", e);
        }
    }

    /**
     * Send Calibration Reminder Email
     * Alerts about upcoming calibration requirements
     */
    @Async
    public void sendCalibrationReminderEmail(CalibrationReminderEmailDTO dto) {
        logger.info("⚙️ [CALIBRATION REMINDER EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), "Calibration Reminder", "calibration reminder");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject("⚙️ Calibration Due Soon - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildCalibrationReminderEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Calibration reminder email sent successfully to: " + dto.getToEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Days Remaining: " + dto.getDaysRemaining() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send calibration reminder email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send calibration reminder email.", e);
        }
    }

    /**
     * Send Waitlist Promotion Email
     * Notifies user when they've been automatically promoted from waitlist to confirmed booking
     */
    @Async
    public void sendWaitlistPromotionEmail(WaitlistPromotionEmailDTO dto) {
        logger.info("🎉 [WAITLIST PROMOTION EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), "Waitlist Promotion", "waitlist promotion");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject("🎉 Booking Confirmed - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildWaitlistPromotionEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Waitlist promotion email sent successfully to: " + dto.getToEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Booking Status: " + dto.getNewBookingStatus() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send waitlist promotion email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send waitlist promotion email.", e);
        }
    }

    /**
     * Send Custom Email
     * Flexible method for sending custom emails with validation
     */
    @Async
    public void sendCustomEmail(CustomEmailDTO dto) {
        logger.info("📨 [CUSTOM EMAIL] Sending to: " + dto.getToEmail());
        try {
            validateEmailDTO(dto.getToEmail(), dto.getSubject(), dto.getMessage());
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getToEmail());
            helper.setSubject(dto.getSubject());
            helper.setFrom(senderEmail, appName);

            if (dto.isHtml()) {
                helper.setText(dto.getMessage(), true);
            } else {
                helper.setText(dto.getMessage(), false);
            }

            mailSender.send(message);
            logger.info("✅ Custom email sent successfully to: " + dto.getToEmail() + 
                       " | Subject: " + dto.getSubject() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send custom email to: " + dto.getToEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send custom email.", e);
        }
    }

    /**
     * Validate email DTO before sending
     * Ensures all required fields are present and valid
     */
    private void validateEmailDTO(String toEmail, String subject, String message) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email address cannot be empty");
        }
        if (!toEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email address format: " + toEmail);
        }
        if (subject == null || subject.trim().isEmpty()) {
            throw new IllegalArgumentException("Email subject cannot be empty");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Email message cannot be empty");
        }
    }

    // ========================================
    // HTML EMAIL TEMPLATE BUILDERS
    // ========================================

    /**
     * Build HTML email for Booking Approved notification
     */
    private String buildBookingApprovedEmail(BookingApprovedEmailDTO dto) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #10b981; margin: 0; font-size: 32px;'>✅ Booking Approved!</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(dto.getUserName()) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Great news! Your booking request has been <strong style='color: #10b981;'>APPROVED</strong>.</p>" +
               
               "<div style='background: #064e3b; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #6ee7b7; margin-top: 0; font-size: 20px;'>📋 Booking Details</h3>" +
               "<table style='width: 100%; color: #d1fae5; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               (dto.getEquipmentId() != null ? "<tr><td style='padding: 8px 0;'><strong>Equipment ID:</strong></td><td>#" + dto.getEquipmentId() + "</td></tr>" : "") +
               (dto.getBookingDate() != null ? "<tr><td style='padding: 8px 0;'><strong>Date:</strong></td><td>" + dto.getBookingDate() + "</td></tr>" : "") +
               (dto.getBookingTime() != null ? "<tr><td style='padding: 8px 0;'><strong>Time:</strong></td><td>" + dto.getBookingTime() + "</td></tr>" : "") +
               (dto.getLabName() != null ? "<tr><td style='padding: 8px 0;'><strong>Lab:</strong></td><td>" + escapeHtml(dto.getLabName()) + "</td></tr>" : "") +
               (dto.getDepartment() != null ? "<tr><td style='padding: 8px 0;'><strong>Department:</strong></td><td>" + escapeHtml(dto.getDepartment()) + "</td></tr>" : "") +
               "<tr><td style='padding: 8px 0;'><strong>Status:</strong></td><td><span style='background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>" + escapeHtml(dto.getBookingStatus()) + "</span></td></tr>" +
               (dto.getPurpose() != null ? "<tr><td style='padding: 8px 0;'><strong>Purpose:</strong></td><td>" + escapeHtml(dto.getPurpose()) + "</td></tr>" : "") +
               "</table></div>" +
               
               "<div style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>📌 Important:</strong> Please arrive on time and ensure you check out the equipment properly after use.</p>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/bookings' style='display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "View My Bookings</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    /**
     * Build HTML email for Booking Rejected notification
     */
    private String buildBookingRejectedEmail(BookingRejectedEmailDTO dto) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #ef4444; margin: 0; font-size: 32px;'>❌ Booking Rejected</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(dto.getUserName()) + ",</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>We regret to inform you that your booking request has been <strong style='color: #ef4444;'>REJECTED</strong>.</p>" +
               
               "<div style='background: #7f1d1d; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #fca5a5; margin-top: 0; font-size: 20px;'>📋 Booking Details</h3>" +
               "<table style='width: 100%; color: #fecaca; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               (dto.getBookingDate() != null ? "<tr><td style='padding: 8px 0;'><strong>Date:</strong></td><td>" + dto.getBookingDate() + "</td></tr>" : "") +
               (dto.getBookingTime() != null ? "<tr><td style='padding: 8px 0;'><strong>Time:</strong></td><td>" + dto.getBookingTime() + "</td></tr>" : "") +
               "</table></div>" +
               
               "<div style='background: #991b1b; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #fca5a5; margin-top: 0; font-size: 18px;'>📝 Rejection Reason</h3>" +
               "<p style='color: #fecaca; margin: 0; font-size: 15px; line-height: 1.6;'>" + escapeHtml(dto.getRejectionReason()) + "</p>" +
               "</div>" +
               
               "<div style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>💡 Next Steps:</strong> You can try booking a different time slot or contact us for assistance.</p>" +
               "</div>" +
               
               (dto.getContactEmail() != null || dto.getContactPhone() != null ? 
               "<div style='background: #374151; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<h4 style='color: #9ca3af; margin-top: 0; font-size: 16px;'>📞 Contact Information</h4>" +
               (dto.getContactEmail() != null ? "<p style='color: #d1d5db; margin: 5px 0;'>Email: <a href='mailto:" + dto.getContactEmail() + "' style='color: #60a5fa;'>" + dto.getContactEmail() + "</a></p>" : "") +
               (dto.getContactPhone() != null ? "<p style='color: #d1d5db; margin: 5px 0;'>Phone: " + escapeHtml(dto.getContactPhone()) + "</p>" : "") +
               "</div>" : "") +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/equipment' style='display: inline-block; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "Browse Equipment</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    /**
     * Build HTML email for Maintenance Reminder notification
     */
    private String buildMaintenanceReminderEmail(MaintenanceReminderEmailDTO dto) {
        String maintenanceDateStr = dto.getMaintenanceDate().format(DATETIME_FORMATTER);
        
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #f59e0b; margin: 0; font-size: 32px;'>🔧 Maintenance Reminder</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(dto.getAssignedTechnician()) + ",</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>This is a reminder about the scheduled maintenance for the following equipment:</p>" +
               
               "<div style='background: #78350f; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #fbbf24; margin-top: 0; font-size: 20px;'>🔧 Maintenance Details</h3>" +
               "<table style='width: 100%; color: #fde68a; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment ID:</strong></td><td>#" + dto.getEquipmentId() + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Scheduled Date:</strong></td><td>" + maintenanceDateStr + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Assigned To:</strong></td><td>" + escapeHtml(dto.getAssignedTechnician()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Current Status:</strong></td><td><span style='background: #f59e0b; color: #78350f; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>" + escapeHtml(dto.getEquipmentStatus()) + "</span></td></tr>" +
               (dto.getMaintenanceType() != null ? "<tr><td style='padding: 8px 0;'><strong>Type:</strong></td><td>" + escapeHtml(dto.getMaintenanceType()) + "</td></tr>" : "") +
               "</table></div>" +
               
               (dto.getNotes() != null ? 
               "<div style='background: #374151; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<h4 style='color: #9ca3af; margin-top: 0; font-size: 16px;'>📝 Additional Notes</h4>" +
               "<p style='color: #d1d5db; margin: 0; line-height: 1.6;'>" + escapeHtml(dto.getNotes()) + "</p>" +
               "</div>" : "") +
               
               "<div style='background: #991b1b; color: #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>⚠️ Important:</strong> Please complete the maintenance on schedule to avoid equipment downtime.</p>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/equipment/" + dto.getEquipmentId() + "' style='display: inline-block; background: linear-gradient(135deg, #d97706, #f59e0b); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "View Equipment Details</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    /**
     * Build HTML email for Calibration Reminder notification
     */
    private String buildCalibrationReminderEmail(CalibrationReminderEmailDTO dto) {
        String dueDateStr = dto.getCalibrationDueDate().format(DATE_FORMATTER);
        String urgencyColor = dto.getDaysRemaining() <= 7 ? "#ef4444" : (dto.getDaysRemaining() <= 14 ? "#f59e0b" : "#3b82f6");
        
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: " + urgencyColor + "; margin: 0; font-size: 32px;'>⚙️ Calibration Due Soon</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Calibration Alert!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>The following equipment requires calibration soon:</p>" +
               
               "<div style='background: #1e3a8a; border-left: 4px solid " + urgencyColor + "; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #93c5fd; margin-top: 0; font-size: 20px;'>⚙️ Calibration Details</h3>" +
               "<table style='width: 100%; color: #bfdbfe; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment ID:</strong></td><td>#" + dto.getEquipmentId() + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Due Date:</strong></td><td>" + dueDateStr + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Days Remaining:</strong></td><td><span style='background: " + urgencyColor + "; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>" + dto.getDaysRemaining() + " days</span></td></tr>" +
               (dto.getCalibrationFrequency() != null ? "<tr><td style='padding: 8px 0;'><strong>Frequency:</strong></td><td>" + escapeHtml(dto.getCalibrationFrequency()) + "</td></tr>" : "") +
               "</table></div>" +
               
               (dto.getReminderMessage() != null ? 
               "<div style='background: #374151; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='color: #d1d5db; margin: 0; line-height: 1.6;'>" + escapeHtml(dto.getReminderMessage()) + "</p>" +
               "</div>" : "") +
               
               "<div style='background: " + (dto.getDaysRemaining() <= 7 ? "#991b1b" : "#92400e") + "; color: " + (dto.getDaysRemaining() <= 7 ? "#fca5a5" : "#fbbf24") + "; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>" + (dto.getDaysRemaining() <= 7 ? "🚨 URGENT" : "⚠️ ATTENTION") + ":</strong> Equipment cannot be used after the calibration due date!</p>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/equipment/" + dto.getEquipmentId() + "' style='display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "Schedule Calibration</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    /**
     * Build HTML email for Waitlist Promotion notification
     */
    private String buildWaitlistPromotionEmail(WaitlistPromotionEmailDTO dto) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #a855f7; margin: 0; font-size: 32px;'>🎉 Booking Confirmed!</h1>" +
               "<p style='color: #c084fc; font-size: 16px; margin-top: 10px;'>You've been promoted from the waitlist</p>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Hi " + escapeHtml(dto.getUserName()) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Great news! A slot has become available and your booking has been <strong style='color: #a855f7;'>AUTOMATICALLY CONFIRMED</strong>.</p>" +
               
               "<div style='background: #581c87; border-left: 4px solid #a855f7; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: #e9d5ff; margin-top: 0; font-size: 20px;'>📋 Confirmed Booking Details</h3>" +
               "<table style='width: 100%; color: #f3e8ff; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               (dto.getBookingDate() != null ? "<tr><td style='padding: 8px 0;'><strong>Date:</strong></td><td>" + dto.getBookingDate() + "</td></tr>" : "") +
               (dto.getBookingTime() != null ? "<tr><td style='padding: 8px 0;'><strong>Time:</strong></td><td>" + dto.getBookingTime() + "</td></tr>" : "") +
               "<tr><td style='padding: 8px 0;'><strong>Status:</strong></td><td><span style='background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>" + escapeHtml(dto.getNewBookingStatus()) + "</span></td></tr>" +
               "</table></div>" +
               
               (dto.getConfirmationMessage() != null ? 
               "<div style='background: #064e3b; border: 2px solid #10b981; color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 15px; line-height: 1.6;'>" + escapeHtml(dto.getConfirmationMessage()) + "</p>" +
               "</div>" : "") +
               
               "<div style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>📌 Action Required:</strong> Please arrive on time. If you cannot make it, please cancel your booking so others can use the equipment.</p>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/bookings' style='display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "View Booking Details</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }

    /**
     * Send Calibration Success/Completion Notification Email
     * Notifies LAB_MANAGER when technician completes calibration (PASS or FAIL)
     */
    @Async
    public void sendCalibrationSuccessEmail(CalibrationSuccessEmailDTO dto) {
        logger.info("✅ [CALIBRATION SUCCESS EMAIL] Sending to: " + dto.getRecipientEmail());
        try {
            validateEmailDTO(dto.getRecipientEmail(), "Calibration Complete", "calibration completion notification");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getRecipientEmail());
            String resultIcon = "PASS".equals(dto.getResult()) ? "✅" : "❌";
            helper.setSubject(resultIcon + " Calibration Complete - " + dto.getEquipmentName());
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildCalibrationSuccessEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Calibration success email sent successfully to: " + dto.getRecipientEmail() + 
                       " | Equipment: " + dto.getEquipmentName() + 
                       " | Result: " + dto.getResult() + 
                       " | Time: " + LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("❌ Failed to send calibration success email to: " + dto.getRecipientEmail() + 
                         ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send calibration success email.", e);
        }
    }

    /**
     * Build HTML email for Calibration Success notification
     */
    private String buildCalibrationSuccessEmail(CalibrationSuccessEmailDTO dto) {
        boolean isPassed = "PASS".equalsIgnoreCase(dto.getResult());
        String statusColor = isPassed ? "#10b981" : "#ef4444";
        String statusBgColor = isPassed ? "#064e3b" : "#7f1d1d";
        String statusTextColor = isPassed ? "#d1fae5" : "#fecaca";
        String statusIcon = isPassed ? "✅" : "❌";
        
        String calibrationDateStr = dto.getCalibrationDate() != null ? 
            dto.getCalibrationDate().format(DATE_FORMATTER) : "N/A";
        String nextDueDateStr = dto.getNextDueDate() != null ? 
            dto.getNextDueDate().format(DATE_FORMATTER) : "N/A";
        
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: " + statusColor + "; margin: 0; font-size: 32px;'>" + statusIcon + " Calibration Complete</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Dear Lab Manager,</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Calibration has been completed for the following equipment:</p>" +
               
               "<div style='background: " + statusBgColor + "; border-left: 4px solid " + statusColor + "; padding: 20px; border-radius: 8px; margin: 25px 0;'>" +
               "<h3 style='color: " + statusTextColor + "; margin-top: 0; font-size: 20px;'>⚙️ Calibration Details</h3>" +
               "<table style='width: 100%; color: " + statusTextColor + "; font-size: 15px;'>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment:</strong></td><td>" + escapeHtml(dto.getEquipmentName()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Equipment ID:</strong></td><td>#" + dto.getEquipmentId() + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Certificate #:</strong></td><td>" + escapeHtml(dto.getCertificateNumber()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Calibration Date:</strong></td><td>" + calibrationDateStr + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Next Due Date:</strong></td><td>" + nextDueDateStr + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Technician:</strong></td><td>" + escapeHtml(dto.getTechnicianName()) + "</td></tr>" +
               "<tr><td style='padding: 8px 0;'><strong>Result:</strong></td><td><span style='background: " + statusColor + "; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>" + escapeHtml(dto.getResult()) + "</span></td></tr>" +
               "</table></div>" +
               
               (dto.getRemarks() != null && !dto.getRemarks().isEmpty() ? 
               "<div style='background: #374151; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<h4 style='color: #9ca3af; margin-top: 0; font-size: 16px;'>📝 Technician Remarks</h4>" +
               "<p style='color: #d1d5db; margin: 0; line-height: 1.6;'>" + escapeHtml(dto.getRemarks()) + "</p>" +
               "</div>" : "") +
               
               (isPassed ? 
               "<div style='background: #064e3b; border: 2px solid #10b981; color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>✅ SUCCESS:</strong> Equipment has been calibrated successfully and is ready for use!</p>" +
               "</div>" :
               "<div style='background: #991b1b; border: 2px solid #ef4444; color: #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>⚠️ FAILED:</strong> Calibration failed. Equipment may require servicing or replacement.</p>" +
               "</div>") +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "/calibrations' style='display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;'>" +
               "View Calibration Records</a></div>" +
               
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2026 " + appName +
               "</p></div></div></body></html>";
    }
}