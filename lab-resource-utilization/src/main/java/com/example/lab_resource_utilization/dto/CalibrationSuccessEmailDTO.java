package com.example.lab_resource_utilization.dto;

import java.time.LocalDate;

/**
 * DTO for Calibration Success Email Notification
 * Sent to LAB_MANAGER when technician completes calibration (PASS or FAIL)
 */
public class CalibrationSuccessEmailDTO {
    private String recipientEmail;      // LAB_MANAGER's email
    private String equipmentName;
    private Long equipmentId;
    private String certificateNumber;
    private LocalDate calibrationDate;
    private LocalDate nextDueDate;
    private String technicianName;
    private String result;              // "PASS" or "FAIL"
    private String remarks;

    // Constructors
    public CalibrationSuccessEmailDTO() {
    }

    public CalibrationSuccessEmailDTO(String recipientEmail, String equipmentName, Long equipmentId, 
                                     String certificateNumber, LocalDate calibrationDate, LocalDate nextDueDate,
                                     String technicianName, String result, String remarks) {
        this.recipientEmail = recipientEmail;
        this.equipmentName = equipmentName;
        this.equipmentId = equipmentId;
        this.certificateNumber = certificateNumber;
        this.calibrationDate = calibrationDate;
        this.nextDueDate = nextDueDate;
        this.technicianName = technicianName;
        this.result = result;
        this.remarks = remarks;
    }

    // Getters and Setters
    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public LocalDate getCalibrationDate() {
        return calibrationDate;
    }

    public void setCalibrationDate(LocalDate calibrationDate) {
        this.calibrationDate = calibrationDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String recipientEmail;
        private String equipmentName;
        private Long equipmentId;
        private String certificateNumber;
        private LocalDate calibrationDate;
        private LocalDate nextDueDate;
        private String technicianName;
        private String result;
        private String remarks;

        public Builder recipientEmail(String recipientEmail) {
            this.recipientEmail = recipientEmail;
            return this;
        }

        public Builder equipmentName(String equipmentName) {
            this.equipmentName = equipmentName;
            return this;
        }

        public Builder equipmentId(Long equipmentId) {
            this.equipmentId = equipmentId;
            return this;
        }

        public Builder certificateNumber(String certificateNumber) {
            this.certificateNumber = certificateNumber;
            return this;
        }

        public Builder calibrationDate(LocalDate calibrationDate) {
            this.calibrationDate = calibrationDate;
            return this;
        }

        public Builder nextDueDate(LocalDate nextDueDate) {
            this.nextDueDate = nextDueDate;
            return this;
        }

        public Builder technicianName(String technicianName) {
            this.technicianName = technicianName;
            return this;
        }

        public Builder result(String result) {
            this.result = result;
            return this;
        }

        public Builder remarks(String remarks) {
            this.remarks = remarks;
            return this;
        }

        public CalibrationSuccessEmailDTO build() {
            return new CalibrationSuccessEmailDTO(recipientEmail, equipmentName, equipmentId, 
                                                 certificateNumber, calibrationDate, nextDueDate,
                                                 technicianName, result, remarks);
        }
    }
}
