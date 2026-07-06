package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.UtilizationResponse;
import com.example.lab_resource_utilization.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/utilization")
    public UtilizationResponse getUtilizationAnalytics() {
        return analyticsService.getUtilizationAnalytics();
    }
}
