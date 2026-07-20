package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.NotificationResponse;
import com.example.lab_resource_utilization.dto.BookingApprovedEmailDTO;
import com.example.lab_resource_utilization.dto.BookingRejectedEmailDTO;
import com.example.lab_resource_utilization.entity.Notification;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.lab_resource_utilization.entity.Booking;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private EmailService emailService;

    /*
     * Create a new notification
     */
    public void createNotification(User user,
                                   String title,
                                   String message,
                                   String type) {
        System.out.println("✅ Saving notification for user: " + user.getEmail());
        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        System.out.println("Saving to database...");
        notificationRepository.save(notification);

    }

    public void notifyBookingStatusChange(Booking booking) {

        String title;
        String message;
        String type;

        System.out.println("🔥 Notification method called for status: " + booking.getStatus());

        switch (booking.getStatus()) {

            case CONFIRMED:
                title = "Booking Approved";
                message = "Your booking for " +
                        booking.getEquipment().getName() +
                        " has been approved.";
                type = "SUCCESS";
                
                // 📧 Send approval email
                sendBookingApprovedEmail(booking);
                break;

            case REJECTED:
                title = "Booking Rejected";
                message = "Your booking for " +
                        booking.getEquipment().getName() +
                        " has been rejected.";
                type = "ERROR";
                
                // 📧 Send rejection email
                sendBookingRejectedEmail(booking);
                break;

            case CANCELLED:
                title = "Booking Cancelled";
                message = "Your booking for " +
                        booking.getEquipment().getName() +
                        " has been cancelled.";
                type = "WARNING";
                
                // 📧 Send cancellation email
                sendBookingCancelledEmail(booking);
                break;

            case IN_USE:
                title = "Equipment Checked Out";
                message = "You have checked out " +
                        booking.getEquipment().getName() + ".";
                type = "INFO";
                break;

            case COMPLETED:
                title = "Booking Completed";
                message = "Thank you for using " +
                        booking.getEquipment().getName() + ".";
                type = "SUCCESS";
                break;

            case NO_SHOW:
                title = "Booking Marked No Show";
                message = "You were marked as a No Show.";
                type = "ERROR";
                break;

            default:
                return;
        }

        createNotification(
                booking.getUser(),
                title,
                message,
                type
        );
    }
    
    /**
     * Send booking approved email notification
     */
    private void sendBookingApprovedEmail(Booking booking) {
        try {
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
            
            String fromDateTime = booking.getStartTime().format(dateTimeFormatter);
            String toDateTime = booking.getEndTime().format(dateTimeFormatter);
            
            BookingApprovedEmailDTO emailDTO = BookingApprovedEmailDTO.builder()
                .toEmail(booking.getUser().getEmail())
                .userName(booking.getUser().getName())
                .equipmentName(booking.getEquipment().getName())
                .equipmentId(booking.getEquipment().getId().toString())
                .bookingDate(null)  // Not needed anymore
                .bookingTime("from " + fromDateTime + " to " + toDateTime)
                .labName(booking.getEquipment().getInstitution())
                .department(booking.getEquipment().getDepartment())
                .bookingStatus("CONFIRMED")
                .build();
                
            emailService.sendBookingApprovedEmail(emailDTO);
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking approved email: " + e.getMessage());
        }
    }
    
    /**
     * Send booking rejected email notification
     */
    private void sendBookingRejectedEmail(Booking booking) {
        try {
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
            
            String fromDateTime = booking.getStartTime().format(dateTimeFormatter);
            String toDateTime = booking.getEndTime().format(dateTimeFormatter);
            
            BookingRejectedEmailDTO emailDTO = BookingRejectedEmailDTO.builder()
                .toEmail(booking.getUser().getEmail())
                .userName(booking.getUser().getName())
                .equipmentName(booking.getEquipment().getName())
                .bookingDate(null)  // Not needed anymore
                .bookingTime("from " + fromDateTime + " to " + toDateTime)
                .rejectionReason("Your booking request has been reviewed and rejected by the lab manager.")
                .contactEmail("support@labresource.com")
                .build();
                
            emailService.sendBookingRejectedEmail(emailDTO);
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking rejected email: " + e.getMessage());
        }
    }
    
    /**
     * Send booking cancelled email notification
     */
    private void sendBookingCancelledEmail(Booking booking) {
        try {
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
            
            String fromDateTime = booking.getStartTime().format(dateTimeFormatter);
            String toDateTime = booking.getEndTime().format(dateTimeFormatter);
            
            // Reuse BookingRejectedEmailDTO structure but with cancellation message
            BookingRejectedEmailDTO emailDTO = BookingRejectedEmailDTO.builder()
                .toEmail(booking.getUser().getEmail())
                .userName(booking.getUser().getName())
                .equipmentName(booking.getEquipment().getName())
                .bookingDate(null)  // Not needed anymore
                .bookingTime("from " + fromDateTime + " to " + toDateTime)
                .rejectionReason("Your booking has been cancelled by the lab manager.")
                .contactEmail(null)  // Don't show contact information
                .build();
                
            emailService.sendBookingRejectedEmail(emailDTO);
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking cancelled email: " + e.getMessage());
        }
    }

    /*
     * Get notifications of logged-in user
     */
    public List<NotificationResponse> getMyNotifications(Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notification ->

                        new NotificationResponse(

                                notification.getId(),

                                notification.getTitle(),

                                notification.getMessage(),

                                notification.getType(),

                                notification.isRead(),

                                notification.getCreatedAt()

                        )

                )
                .toList();

    }

    public void markAsRead(Long notificationId, Long userId) {

        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setRead(true);

        notificationRepository.save(notification);

    }

    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository.findByUserIdAndIsReadFalse(userId);

        notifications.forEach(notification ->
                notification.setRead(true));

        notificationRepository.saveAll(notifications);

    }

}