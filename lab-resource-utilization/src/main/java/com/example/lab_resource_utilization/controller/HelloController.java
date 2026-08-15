package com.example.lab_resource_utilization.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HelloController {

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
}
