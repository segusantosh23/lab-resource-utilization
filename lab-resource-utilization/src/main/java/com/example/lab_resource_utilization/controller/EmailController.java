package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.*;
import com.example.lab_resource_utilization.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for testing Email Notification System
 * Provides endpoints to test all email notification types
 * 
 * @author Lab Resource Utilization Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/email")
@Validated
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Test endpoint - Send a simple test email
     * POST /api/email/test
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@Valid @RequestBody CustomEmailDTO dto) {
        try {
            emailService.sendCustomEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("subject", dto.getSubject());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Booking Approved Email
     * POST /api/email/booking-approved
     */
    @PostMapping("/booking-approved")
    public ResponseEntity<Map<String, Object>> sendBookingApprovedEmail(
            @Valid @RequestBody BookingApprovedEmailDTO dto) {
        try {
            emailService.sendBookingApprovedEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking approved email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("equipmentName", dto.getEquipmentName());
            response.put("bookingDate", dto.getBookingDate());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Booking Rejected Email
     * POST /api/email/booking-rejected
     */
    @PostMapping("/booking-rejected")
    public ResponseEntity<Map<String, Object>> sendBookingRejectedEmail(
            @Valid @RequestBody BookingRejectedEmailDTO dto) {
        try {
            emailService.sendBookingRejectedEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking rejected email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("equipmentName", dto.getEquipmentName());
            response.put("rejectionReason", dto.getRejectionReason());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Maintenance Reminder Email
     * POST /api/email/maintenance-reminder
     */
    @PostMapping("/maintenance-reminder")
    public ResponseEntity<Map<String, Object>> sendMaintenanceReminderEmail(
            @Valid @RequestBody MaintenanceReminderEmailDTO dto) {
        try {
            emailService.sendMaintenanceReminderEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Maintenance reminder email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("equipmentName", dto.getEquipmentName());
            response.put("maintenanceDate", dto.getMaintenanceDate());
            response.put("assignedTechnician", dto.getAssignedTechnician());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Calibration Reminder Email
     * POST /api/email/calibration-reminder
     */
    @PostMapping("/calibration-reminder")
    public ResponseEntity<Map<String, Object>> sendCalibrationReminderEmail(
            @Valid @RequestBody CalibrationReminderEmailDTO dto) {
        try {
            emailService.sendCalibrationReminderEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Calibration reminder email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("equipmentName", dto.getEquipmentName());
            response.put("calibrationDueDate", dto.getCalibrationDueDate());
            response.put("daysRemaining", dto.getDaysRemaining());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Waitlist Promotion Email
     * POST /api/email/waitlist-promotion
     */
    @PostMapping("/waitlist-promotion")
    public ResponseEntity<Map<String, Object>> sendWaitlistPromotionEmail(
            @Valid @RequestBody WaitlistPromotionEmailDTO dto) {
        try {
            emailService.sendWaitlistPromotionEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Waitlist promotion email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("equipmentName", dto.getEquipmentName());
            response.put("bookingDate", dto.getBookingDate());
            response.put("newBookingStatus", dto.getNewBookingStatus());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Send Custom Email
     * POST /api/email/custom
     */
    @PostMapping("/custom")
    public ResponseEntity<Map<String, Object>> sendCustomEmail(@Valid @RequestBody CustomEmailDTO dto) {
        try {
            emailService.sendCustomEmail(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Custom email sent successfully");
            response.put("recipient", dto.getToEmail());
            response.put("subject", dto.getSubject());
            response.put("isHtml", dto.isHtml());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Email Send Failed", e.getMessage());
        }
    }

    /**
     * Health check endpoint
     * GET /api/email/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Email Notification System");
        response.put("timestamp", LocalDateTime.now());
        response.put("availableEndpoints", new String[]{
            "POST /api/email/test",
            "POST /api/email/booking-approved",
            "POST /api/email/booking-rejected",
            "POST /api/email/maintenance-reminder",
            "POST /api/email/calibration-reminder",
            "POST /api/email/waitlist-promotion",
            "POST /api/email/custom"
        });
        
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to create error responses
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(
            HttpStatus status, String error, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", error);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        
        return ResponseEntity.status(status).body(response);
    }
}
