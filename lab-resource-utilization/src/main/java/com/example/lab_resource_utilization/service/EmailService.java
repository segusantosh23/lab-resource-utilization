package com.example.lab_resource_utilization.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.name}")
    private String appName;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.support-email}")
    private String supportEmail;

    public void sendSignupOTP(String toEmail, String otp, String userName) {
        logger.info("📧 [OTP GENERATED] Email: " + toEmail + " | OTP: " + otp + " | User: " + userName);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Email Verification");
            try {
                helper.setFrom(senderEmail, appName);
            } catch (java.io.UnsupportedEncodingException e) {
                helper.setFrom(senderEmail);
            }

            String htmlContent = buildSignupOTPEmail(userName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ OTP email sent to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Gmail not configured - OTP logged to console instead. Error: " + e.getMessage());
            // Don't throw - OTP still works for testing
        }
    }

    public void sendPasswordResetOTP(String toEmail, String otp, String userName) {
        logger.info("📧 [OTP GENERATED] Email: " + toEmail + " | OTP: " + otp + " | User: " + userName);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Password Reset - " + appName + " OTP: " + otp);
            try {
                helper.setFrom(senderEmail, appName);
            } catch (java.io.UnsupportedEncodingException e) {
                helper.setFrom(senderEmail);
            }

            String htmlContent = buildPasswordResetOTPEmail(userName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Password reset OTP sent to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Gmail not configured - OTP logged to console instead. Error: " + e.getMessage());
            // Don't throw - OTP still works for testing
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        logger.info("📧 [WELCOME EMAIL] Sent to: " + toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + appName + "!");
            try {
                helper.setFrom(senderEmail, appName);
            } catch (java.io.UnsupportedEncodingException e) {
                helper.setFrom(senderEmail);
            }

            String htmlContent = buildWelcomeEmail(userName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            logger.warning("⚠️ Gmail not configured - Welcome logged instead. Error: " + e.getMessage());
            // Don't throw - registration already completed
        }
    }

    private String buildSignupOTPEmail(String userName, String otp) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px;'>" +
               "<h1 style='color: #a855f7; text-align: center;'>🔐 Email Verification</h1>" +
               "<p style='font-size: 16px; line-height: 1.6;'>Hi " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 18px; line-height: 1.8; margin: 30px 0;'>Your OTP is: <strong style='color: #a855f7; font-size: 24px; letter-spacing: 4px; font-family: monospace;'>" + otp + "</strong></p>" +
               "<p style='font-size: 16px; line-height: 1.8; margin: 20px 0;'>This OTP is valid for <strong>5 minutes</strong>.</p>" +
               "<p style='font-size: 16px; line-height: 1.8; color: #fca5a5; margin: 20px 0;'><strong>Do not share this OTP with anyone.</strong></p>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<p style='font-size: 12px; color: #64748b; text-align: center;'>" +
               "Copyright 2024 " + appName + " | <a href='mailto:" + supportEmail + "' style='color: #a855f7;'>" + supportEmail + "</a>" +
               "</p></div></body></html>";
    }

    private String buildPasswordResetOTPEmail(String userName, String otp) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px;'>" +
               "<h1 style='color: #f59e0b; text-align: center;'>🔑 Password Reset</h1>" +
               "<p style='font-size: 16px; line-height: 1.6;'>Hi " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6;'>We received a request to reset your password. Use this OTP to proceed:</p>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<div style='display: inline-block; background: linear-gradient(135deg, #ea580c, #f59e0b); padding: 20px 40px; border-radius: 12px;'>" +
               "<div style='color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;'>" + otp + "</div>" +
               "</div></div>" +
               "<p style='background: #991b1b; color: #fca5a5; padding: 15px; border-radius: 8px; text-align: center;'>" +
               "⏰ This OTP expires in 1 minute!</p>" +
               "<p style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px;'>" +
               "🔒 If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<p style='font-size: 12px; color: #64748b; text-align: center;'>" +
               "Copyright 2024 " + appName + " | <a href='mailto:" + supportEmail + "' style='color: #f59e0b;'>" + supportEmail + "</a>" +
               "</p></div></body></html>";
    }

    private String buildWelcomeEmail(String userName) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px;'>" +
               "<h1 style='color: #10b981; text-align: center;'>🎉 Welcome!</h1>" +
               "<p style='font-size: 18px; line-height: 1.6;'>Welcome " + escapeHtml(userName) + "!</p>" +
               "<p style='font-size: 16px; line-height: 1.6;'>Your account on " + appName + " has been successfully created!</p>" +
               "<div style='background: #064e3b; border: 1px solid #10b981; color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;'>" +
               "<h3 style='color: #6ee7b7; margin-top: 0;'>What you can do:</h3>" +
               "<ul><li>🔬 Browse and book laboratory equipment</li>" +
               "<li>📅 View real-time availability calendars</li>" +
               "<li>⏳ Join waitlists for high-demand equipment</li>" +
               "<li>📊 Track your booking history</li>" +
               "<li>🔔 Receive notifications about your reservations</li></ul>" +
               "</div>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + baseUrl + "' style='display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold;'>" +
               "Get Started Now</a></div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<p style='font-size: 12px; color: #64748b; text-align: center;'>" +
               "Copyright 2024 " + appName + " | <a href='mailto:" + supportEmail + "' style='color: #10b981;'>" + supportEmail + "</a>" +
               "</p></div></body></html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
