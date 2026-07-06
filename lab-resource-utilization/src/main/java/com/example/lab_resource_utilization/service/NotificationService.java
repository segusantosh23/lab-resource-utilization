package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.NotificationResponse;
import com.example.lab_resource_utilization.entity.Notification;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.lab_resource_utilization.entity.Booking;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

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
                break;

            case REJECTED:
                title = "Booking Rejected";
                message = "Your booking for " +
                        booking.getEquipment().getName() +
                        " has been rejected.";
                type = "ERROR";
                break;

            case CANCELLED:
                title = "Booking Cancelled";
                message = "Your booking for " +
                        booking.getEquipment().getName() +
                        " has been cancelled.";
                type = "WARNING";
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