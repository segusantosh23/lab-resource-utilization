package com.example.lab_resource_utilization.test;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * Standalone test to verify Brevo email configuration
 * Run this class to test if your Brevo SMTP settings work
 */
public class BrevoEmailTest {
    
    public static void main(String[] args) {
        try {
            // Your Brevo SMTP Configuration
            String host = "smtp-relay.brevo.com";
            int port = 587;
            String username = "b1447000@smtp-brevo.com";
            String password = "xsmtpsib-7297db496d9bdf35e51b1e0aba81fd00ae74c72675fcd8696696467059d980b9-JOipOzGnRCR1Ix0m";
            
            // Test email details
            String toEmail = "priyadharshimanikandan25@gmail.com"; // Change this to your email
            String testOTP = "123456";
            
            System.out.println("🔧 Testing Brevo Email Configuration...");
            System.out.println("Host: " + host);
            System.out.println("Port: " + port);
            System.out.println("Username: " + username);
            System.out.println("Sending test email to: " + toEmail);
            System.out.println("----------------------------------------");
            
            // Configure JavaMailSender
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(username);
            mailSender.setPassword(password);
            
            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.debug", "true"); // Enable debug output
            
            // Create and send test email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setFrom(username, "Lab Resource Platform");
            helper.setSubject("✅ Brevo Email Test - OTP Verification");
            
            String htmlContent = buildTestEmail(testOTP);
            helper.setText(htmlContent, true);
            
            // Send the email
            mailSender.send(message);
            
            System.out.println("✅ SUCCESS! Test email sent successfully!");
            System.out.println("📧 Check your inbox: " + toEmail);
            System.out.println("🔐 Test OTP: " + testOTP);
            System.out.println("");
            System.out.println("If you received the email, your Brevo configuration is working correctly!");
            
        } catch (Exception e) {
            System.err.println("❌ ERROR: Failed to send test email");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            System.out.println("");
            System.out.println("🛠️ Troubleshooting:");
            System.out.println("1. Verify your Brevo credentials are correct");
            System.out.println("2. Check your internet connection");
            System.out.println("3. Make sure Brevo account is active");
            System.out.println("4. Try generating a new SMTP key in Brevo");
        }
    }
    
    private static String buildTestEmail(String otp) {
        return "<html><body style='background: #0f1419; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
               "<div style='text-align: center; margin-bottom: 30px;'>" +
               "<h1 style='color: #10b981; margin: 0; font-size: 28px;'>✅ Brevo Email Test</h1>" +
               "</div>" +
               "<p style='font-size: 18px; line-height: 1.6; margin-bottom: 20px;'>Congratulations!</p>" +
               "<p style='font-size: 16px; line-height: 1.6; margin-bottom: 30px;'>Your Brevo SMTP configuration is working correctly! 🎉</p>" +
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<div style='display: inline-block; background: linear-gradient(135deg, #059669, #10b981); padding: 20px 40px; border-radius: 12px; margin: 20px 0;'>" +
               "<span style='color: white; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace;'>TEST OTP: " + otp + "</span>" +
               "</div></div>" +
               "<div style='background: #059669; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>" +
               "<p style='margin: 0; font-size: 16px; font-weight: bold;'>🎯 Your email OTP system is ready to use!</p>" +
               "</div>" +
               "<div style='background: #1e40af; color: #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>Next Steps:</strong></p>" +
               "<ul style='margin: 10px 0; padding-left: 20px;'>" +
               "<li>Start your Spring Boot backend</li>" +
               "<li>Test the signup flow at http://localhost:5173/signup</li>" +
               "<li>Verify OTPs are delivered to email addresses</li>" +
               "</ul></div>" +
               "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;'>" +
               "<div style='text-align: center;'>" +
               "<p style='font-size: 12px; color: #64748b; margin: 0;'>" +
               "© 2024 Lab Resource Platform | Brevo SMTP Integration Test" +
               "</p></div></div></body></html>";
    }
}