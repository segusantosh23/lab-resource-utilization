package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.UtilizationResponse;
import com.example.lab_resource_utilization.entity.BookingStatus;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AnalyticsService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public UtilizationResponse getUtilizationAnalytics() {

        UtilizationResponse response = new UtilizationResponse();

        long totalEquipment = equipmentRepository.count();

        long availableEquipment =
                equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE).size();

        long bookedEquipment =
                equipmentRepository.findByStatus(EquipmentStatus.BOOKED).size();

        long underMaintenanceEquipment =
                equipmentRepository.findByStatus(EquipmentStatus.UNDER_MAINTENANCE).size();

        long totalBookings = bookingRepository.count();

        long utilizedEquipment =
                bookingRepository.countDistinctEquipmentByStatuses(
                        Arrays.asList(
                                BookingStatus.CONFIRMED,
                                BookingStatus.IN_USE
                        )
                );

        double utilizationPercentage = 0;

        if (totalEquipment > 0) {
            utilizationPercentage =
                    ((double) utilizedEquipment / totalEquipment) * 100;
        }

        response.setTotalEquipment(totalEquipment);
        response.setAvailableEquipment(availableEquipment);
        response.setBookedEquipment(bookedEquipment);
        response.setUnderMaintenanceEquipment(underMaintenanceEquipment);
        response.setTotalBookings(totalBookings);
        response.setUtilizationPercentage(utilizationPercentage);

        return response;
    }
}