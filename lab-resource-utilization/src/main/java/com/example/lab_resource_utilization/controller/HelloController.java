package com.example.lab_resource_utilization.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HelloController {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${app.name:Lab Platform}")
    private String appName;

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
            "status", "UP",
            "message", "Lab Resource Utilization API Server is running successfully!"
        );
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello! Spring Boot is connected successfully.";
    }

    @GetMapping("/test-email")
    public Map<String, Object> testEmail(@RequestParam(defaultValue = "test@example.com") String to) {
        Map<String, Object> res = new HashMap<>();
        res.put("configuredSender", senderEmail);
        
        if (mailSender == null) {
            res.put("status", "FAILED");
            res.put("error", "JavaMailSender bean is not initialized.");
            return res;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Test Email - " + appName);
            if (senderEmail != null && !senderEmail.isBlank()) {
                helper.setFrom(senderEmail, appName);
            }
            helper.setText("<h1>Test Email Success!</h1><p>Your SMTP mail configuration is working on Render!</p>", true);
            
            mailSender.send(message);
            res.put("status", "SUCCESS");
            res.put("message", "Email sent successfully to " + to);
        } catch (Exception e) {
            res.put("status", "FAILED");
            res.put("errorClass", e.getClass().getName());
            res.put("errorMessage", e.getMessage());
            if (e.getCause() != null) {
                res.put("cause", e.getCause().getMessage());
            }
        }
        return res;
    }
}
