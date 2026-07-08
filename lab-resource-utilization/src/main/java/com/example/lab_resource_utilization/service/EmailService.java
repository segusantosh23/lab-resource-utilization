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
            
            // Use the sender email configured in application.properties
            helper.setFrom(senderEmail, appName);

            String htmlContent = buildSignupOTPEmail(userName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("✅ OTP email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.severe("❌ Failed to send OTP email to: " + toEmail + ". Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
    }

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
            logger.severe("❌ Failed to send password reset OTP to: " + toEmail + ". Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset email. Please try again.");
        }
    }

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
               "<p style='margin: 0; font-size: 16px; font-weight: bold;'>⏰ This OTP is valid for 5 minutes only</p>" +
               "</div>" +
               "<div style='background: #dc2626; color: #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>🔒 Security Notice:</strong> Do not share this OTP with anyone. Our team will never ask for your OTP.</p>" +
               "</div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2024 " + appName + " | " +
               "<a href='mailto:" + supportEmail + "' style='color: #a855f7; text-decoration: none;'>" + supportEmail + "</a>" +
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
               "© 2024 " + appName + " | " +
               "<a href='mailto:" + supportEmail + "' style='color: #f59e0b; text-decoration: none;'>" + supportEmail + "</a>" +
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
               "© 2024 " + appName + " | " +
               "<a href='mailto:" + supportEmail + "' style='color: #10b981; text-decoration: none;'>" + supportEmail + "</a>" +
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
}
