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
    public List<RealTimeUsageDTO> getRealTimeTracking() {
        return analyticsService.getRealTimeTracking();
    }

    @GetMapping("/equipment-rates")
    public List<EquipmentUtilizationDTO> getEquipmentUtilizationRates() {
        return analyticsService.getEquipmentUtilizationRates();
    }

    @GetMapping("/department-rates")
    public List<GroupUtilizationDTO> getDepartmentUtilizationRates() {
        return analyticsService.getDepartmentUtilizationRates();
    }

    @GetMapping("/institution-rates")
    public List<GroupUtilizationDTO> getInstitutionUtilizationRates() {
        return analyticsService.getInstitutionUtilizationRates();
    }

    @GetMapping("/idle-equipment")
    public List<IdleEquipmentDTO> getIdleEquipment() {
        return analyticsService.getIdleEquipment();
    }

    @GetMapping("/heatmap")
    public Map<String, Map<Integer, Integer>> getUtilizationHeatmap() {
        return analyticsService.getUtilizationHeatmap();
    }

    @GetMapping("/usage-patterns")
    public UsagePatternDTO getUsagePatterns() {
        return analyticsService.getUsagePatterns();
    }
}
