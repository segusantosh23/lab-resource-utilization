package com.example.lab_resource_utilization;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class LabResourceUtilizationApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabResourceUtilizationApplication.class, args);
    }

}