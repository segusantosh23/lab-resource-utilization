package com.example.lab_resource_utilization.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;
import java.util.logging.Logger;

/**
 * Mail Configuration for Brevo SMTP
 * Configures JavaMailSender with proper settings for port 2525
 */
@Configuration
public class MailConfig {

    private static final Logger logger = Logger.getLogger(MailConfig.class.getName());

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        
        // Protocol and authentication
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        
        // STARTTLS configuration for port 2525
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        
        // Trust the Brevo SMTP host
        props.put("mail.smtp.ssl.trust", host);
        
        // Connection timeouts
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        
        // Disable SSL (we're using STARTTLS instead)
        props.put("mail.smtp.ssl.enable", "false");
        
        // Debug mode - logs detailed SMTP conversation
        props.put("mail.debug", "false"); // Set to "true" only for debugging
        
        logger.info("📧 [MAIL CONFIG] Configured JavaMailSender for host: " + host + " port: " + port);
        
        return mailSender;
    }
}
