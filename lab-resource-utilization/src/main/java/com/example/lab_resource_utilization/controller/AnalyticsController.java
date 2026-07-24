package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.EquipmentUtilizationDTO;
import com.example.lab_resource_utilization.dto.RealTimeUsageDTO;
import com.example.lab_resource_utilization.dto.EquipmentUtilizationDTO;
import com.example.lab_resource_utilization.dto.UtilizationResponse;
import com.example.lab_resource_utilization.dto.GroupUtilizationDTO;
import com.example.lab_resource_utilization.dto.IdleEquipmentDTO;
import com.example.lab_resource_utilization.dto.UsagePatternDTO;
import com.example.lab_resource_utilization.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/utilization")
public UtilizationResponse getUtilizationAnalytics(
        @RequestParam String email) {

    return analyticsService.getUtilizationAnalytics(email);
}

   @GetMapping("/real-time-tracking")
public List<RealTimeUsageDTO> getRealTimeTracking(
        @RequestParam String email) {

    return analyticsService.getRealTimeTracking(email);
}
    @GetMapping("/equipment-rates")
public List<EquipmentUtilizationDTO> getEquipmentUtilizationRates(
        @RequestParam String email) {

    return analyticsService.getEquipmentUtilizationRates(email);
}

    @GetMapping("/department-rates")
public List<GroupUtilizationDTO> getDepartmentUtilizationRates(
        @RequestParam String email) {

    return analyticsService.getDepartmentUtilizationRates(email);
}

    @GetMapping("/institution-rates")
public List<GroupUtilizationDTO> getInstitutionUtilizationRates(
        @RequestParam String email) {

    return analyticsService.getInstitutionUtilizationRates(email);
}

    @GetMapping("/idle-equipment")
public List<IdleEquipmentDTO> getIdleEquipment(
        @RequestParam String email) {

    return analyticsService.getIdleEquipment(email);
}

    @GetMapping("/heatmap")
public Map<String, Map<Integer, Integer>> getUtilizationHeatmap(
        @RequestParam String email) {

    return analyticsService.getUtilizationHeatmap(email);
}
    @GetMapping("/usage-patterns")
public UsagePatternDTO getUsagePatterns(
        @RequestParam String email) {

    return analyticsService.getUsagePatterns(email);
}
}
