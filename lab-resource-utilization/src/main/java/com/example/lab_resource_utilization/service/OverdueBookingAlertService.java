package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class OverdueBookingAlertService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    // Run every minute
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void checkForOverdueBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> overdueBookings = bookingRepository.findOverdueBookingsNotNotified(now);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

        for (Booking booking : overdueBookings) {
            String title = "Overdue Equipment Warning";
            String message = String.format(
                "Your booking for '%s' was scheduled to end at %s, but the equipment is still marked as 'In Use'. " +
                "Please return it and click 'Complete' in the system, or contact the lab manager if you need an extension.",
                booking.getEquipment().getName(),
                booking.getEndTime().format(formatter)
            );

            notificationService.createNotification(booking.getUser(), title, message, "WARNING");

            // Mark as notified to avoid duplicate warnings
            booking.setOverdueNotified(true);
            bookingRepository.save(booking);
        }
    }
}
