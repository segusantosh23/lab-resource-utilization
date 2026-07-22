package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.CalibrationRequest;
import com.example.lab_resource_utilization.dto.CalibrationResponse;

import java.util.List;
import java.util.Map;
public interface CalibrationService {

    // Add a new calibration record
    CalibrationResponse addCalibration(CalibrationRequest request);

    // Update an existing calibration record
    CalibrationResponse updateCalibration(Long id, CalibrationRequest request);

    // Delete a calibration record
    void deleteCalibration(Long id);

    // Get calibration by ID
    CalibrationResponse getCalibrationById(Long id);

    // Get all calibration records
    List<CalibrationResponse> getAllCalibrations();

    // Get calibration history of an equipment
    List<CalibrationResponse> getCalibrationHistory(Long equipmentId);

    // Get calibrations due within the next specified number of days
    List<CalibrationResponse> getDueSoonCalibrations(int days);

    // Get expired calibrations
    List<CalibrationResponse> getExpiredCalibrations();

    List<CalibrationResponse> getActiveCalibrations();

List<CalibrationResponse> getFailedCalibrations();

Map<String, Long> getCalibrationSummary();
}