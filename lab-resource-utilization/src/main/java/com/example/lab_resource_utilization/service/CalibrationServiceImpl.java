package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.CalibrationRequest;
import com.example.lab_resource_utilization.dto.CalibrationResponse;
import com.example.lab_resource_utilization.entity.Calibration;
import com.example.lab_resource_utilization.entity.CalibrationResult;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.CalibrationRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CalibrationServiceImpl implements CalibrationService {

    @Autowired
    private CalibrationRepository calibrationRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    // Convert Entity -> DTO
    private CalibrationResponse mapToResponse(Calibration calibration) {

        CalibrationResponse response = new CalibrationResponse();

        response.setId(calibration.getId());

        response.setEquipmentId(calibration.getEquipment().getId());
        response.setEquipmentName(calibration.getEquipment().getName());

        response.setCalibrationDate(calibration.getCalibrationDate());
        response.setNextDueDate(calibration.getNextDueDate());

        response.setCertificateNumber(calibration.getCertificateNumber());
        response.setTechnicianName(calibration.getTechnicianName());

        response.setResult(calibration.getResult());
        response.setRemarks(calibration.getRemarks());

        response.setCreatedAt(calibration.getCreatedAt());
        response.setUpdatedAt(calibration.getUpdatedAt());

        // Calculate Status
        LocalDate today = LocalDate.now();
        LocalDate dueDate = calibration.getNextDueDate();

        if (calibration.getResult() == CalibrationResult.FAIL) {
            response.setStatus("Failed");
        } else if (dueDate.isBefore(today)) {
            response.setStatus("Expired");
        } else if (!dueDate.isAfter(today.plusDays(30))) {
            response.setStatus("Due Soon");
        } else {
            response.setStatus("Active");
        }

        return response;
    }

    // Add Calibration
    @Override
    public CalibrationResponse addCalibration(CalibrationRequest request) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found with id: " + request.getEquipmentId()));

        if (calibrationRepository.existsByCertificateNumber(request.getCertificateNumber())) {
            throw new RuntimeException("Certificate number already exists.");
        }

        Calibration calibration = new Calibration();

        calibration.setEquipment(equipment);
        calibration.setCalibrationDate(request.getCalibrationDate());
        calibration.setNextDueDate(request.getNextDueDate());

        calibration.setCertificateNumber(request.getCertificateNumber());
        calibration.setTechnicianName(request.getTechnicianName());

        calibration.setResult(request.getResult());
        calibration.setRemarks(request.getRemarks());

        Calibration saved = calibrationRepository.save(calibration);

        return mapToResponse(saved);
    }
        // Get All Calibrations
    @Override
    public List<CalibrationResponse> getAllCalibrations() {

        return calibrationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Calibration By ID
    @Override
    public CalibrationResponse getCalibrationById(Long id) {

        Calibration calibration = calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Calibration not found with id: " + id));

        return mapToResponse(calibration);
    }

    // Update Calibration
    @Override
    public CalibrationResponse updateCalibration(Long id, CalibrationRequest request) {

        Calibration calibration = calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Calibration not found with id: " + id));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found with id: " + request.getEquipmentId()));

        calibration.setEquipment(equipment);
        calibration.setCalibrationDate(request.getCalibrationDate());
        calibration.setNextDueDate(request.getNextDueDate());

        // Prevent duplicate certificate numbers
        if (!calibration.getCertificateNumber().equals(request.getCertificateNumber())
                && calibrationRepository.existsByCertificateNumber(request.getCertificateNumber())) {
            throw new RuntimeException("Certificate number already exists.");
        }

        calibration.setCertificateNumber(request.getCertificateNumber());

        calibration.setTechnicianName(request.getTechnicianName());
        calibration.setResult(request.getResult());
        calibration.setRemarks(request.getRemarks());

        Calibration updated = calibrationRepository.save(calibration);

        return mapToResponse(updated);
    }
        // Delete Calibration
    @Override
    public void deleteCalibration(Long id) {

        Calibration calibration = calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Calibration not found with id: " + id));

        calibrationRepository.delete(calibration);
    }

    // Get Calibration History by Equipment
    @Override
    public List<CalibrationResponse> getCalibrationHistory(Long equipmentId) {

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found with id: " + equipmentId));

        return calibrationRepository
                .findByEquipmentOrderByCalibrationDateDesc(equipment)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Due Soon Calibrations
    @Override
    public List<CalibrationResponse> getDueSoonCalibrations(int days) {

        LocalDate today = LocalDate.now();
        LocalDate dueDate = today.plusDays(days);

        return calibrationRepository
                .findByNextDueDateBetween(today, dueDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Expired Calibrations
    @Override
    public List<CalibrationResponse> getExpiredCalibrations() {

        return calibrationRepository
                .findByNextDueDateBefore(LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
        // Get Active Calibrations
    @Override
    public List<CalibrationResponse> getActiveCalibrations() {

        return calibrationRepository
                .findByResultAndNextDueDateAfter(
                        CalibrationResult.PASS,
                        LocalDate.now().plusDays(30)
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Failed Calibrations
    @Override
    public List<CalibrationResponse> getFailedCalibrations() {

        return calibrationRepository
                .findByResult(CalibrationResult.FAIL)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Dashboard Summary
    @Override
    public Map<String, Long> getCalibrationSummary() {

        Map<String, Long> summary = new HashMap<>();

        List<CalibrationResponse> calibrations = getAllCalibrations();

        summary.put("total", (long) calibrations.size());

        summary.put(
                "active",
                calibrations.stream()
                        .filter(c -> "Active".equals(c.getStatus()))
                        .count()
        );

        summary.put(
                "dueSoon",
                calibrations.stream()
                        .filter(c -> "Due Soon".equals(c.getStatus()))
                        .count()
        );

        summary.put(
                "expired",
                calibrations.stream()
                        .filter(c -> "Expired".equals(c.getStatus()))
                        .count()
        );

        summary.put(
                "failed",
                calibrations.stream()
                        .filter(c -> "Failed".equals(c.getStatus()))
                        .count()
        );

        return summary;
    }
}