package com.example.lab_resource_utilization.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.internet.MimeMessage;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HelloController {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

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
        String cleanSender = senderEmail != null ? senderEmail.trim() : "";
        String cleanKey = mailPassword != null ? mailPassword.trim() : "";
        
        res.put("configuredSender", cleanSender);
        res.put("keyLength", cleanKey.length());

        // Step 1: Attempt SMTP Send
        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(to);
                helper.setSubject("Test Email - " + appName);
                if (!cleanSender.isBlank()) {
                    helper.setFrom(cleanSender, appName);
                }
                helper.setText("<h1>Test Email Success!</h1><p>Your mail configuration is working on Render!</p>", true);
                
                mailSender.send(message);
                res.put("status", "SUCCESS");
                res.put("method", "SMTP");
                res.put("message", "Email sent successfully via SMTP to " + to);
                return res;
            }
        } catch (Exception e) {
            res.put("smtpError", e.getMessage());
        }

        // Step 2: Fallback to Brevo HTTPS REST API (Port 443)
        try {
            URL url = new URI("https://api.brevo.com/v3/smtp/email").toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("api-key", cleanKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);

            String jsonPayload = "{\"sender\":{\"name\":\"" + appName + "\",\"email\":\"" + cleanSender + "\"},\"to\":[{\"email\":\"" + to + "\"}],\"subject\":\"Test Email - " + appName + "\",\"htmlContent\":\"<h1>Test Email Success!</h1><p>Sent via Brevo HTTPS REST API on Render!</p>\"}";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            if (code >= 200 && code < 300) {
                res.put("status", "SUCCESS");
                res.put("method", "BREVO_HTTPS_API");
                res.put("message", "Email sent successfully via Brevo HTTPS API to " + to);
                return res;
            } else {
                res.put("brevoHttpCode", code);
                if (conn.getErrorStream() != null) {
                    res.put("brevoHttpResponse", new String(conn.getErrorStream().readAllBytes(), StandardCharsets.UTF_8));
                }
            }
        } catch (Exception ex) {
            res.put("brevoHttpError", ex.getMessage());
        }

        res.put("status", "FAILED");
        return res;
    }
}
