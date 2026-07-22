package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.CalibrationRequest;
import com.example.lab_resource_utilization.dto.CalibrationResponse;
import com.example.lab_resource_utilization.service.CalibrationService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calibrations")
@CrossOrigin(origins = "*")
public class CalibrationController {

    @Autowired
    private CalibrationService calibrationService;


    // Add Calibration
    @PostMapping
    public CalibrationResponse addCalibration(
            @Valid @RequestBody CalibrationRequest request) {

        return calibrationService.addCalibration(request);
    }


    // Get All Calibrations
    @GetMapping
    public List<CalibrationResponse> getAllCalibrations() {

        return calibrationService.getAllCalibrations();
    }


    // Get Calibration By ID
    @GetMapping("/{id}")
    public CalibrationResponse getCalibrationById(
            @PathVariable Long id) {

        return calibrationService.getCalibrationById(id);
    }


    // Update Calibration
    @PutMapping("/{id}")
    public CalibrationResponse updateCalibration(
            @PathVariable Long id,
            @Valid @RequestBody CalibrationRequest request) {

        return calibrationService.updateCalibration(id, request);
    }


    // Delete Calibration
    @PreAuthorize("hasRole('LAB_MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteCalibration(
            @PathVariable Long id) {

        calibrationService.deleteCalibration(id);
    }


    // Get Calibration History of Equipment
    @GetMapping("/equipment/{equipmentId}")
    public List<CalibrationResponse> getCalibrationHistory(
            @PathVariable Long equipmentId) {

        return calibrationService.getCalibrationHistory(equipmentId);
    }


    // Get Due Soon Calibrations
    @GetMapping("/due-soon")
    public List<CalibrationResponse> getDueSoonCalibrations(
            @RequestParam(defaultValue = "30") int days) {

        return calibrationService.getDueSoonCalibrations(days);
    }


    // Get Expired Calibrations
    @GetMapping("/expired")
    public List<CalibrationResponse> getExpiredCalibrations() {

        return calibrationService.getExpiredCalibrations();
    }


    // Get Active Calibrations
    @GetMapping("/active")
    public List<CalibrationResponse> getActiveCalibrations() {

        return calibrationService.getActiveCalibrations();
    }


    // Get Failed Calibrations
    @GetMapping("/failed")
    public List<CalibrationResponse> getFailedCalibrations() {

        return calibrationService.getFailedCalibrations();
    }


    // Get Calibration Summary
    @GetMapping("/summary")
    public Map<String, Long> getCalibrationSummary() {

        return calibrationService.getCalibrationSummary();
    }

}