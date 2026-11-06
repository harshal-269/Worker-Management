
package com.localworker.backend.service;

import com.localworker.backend.dto.NotificationResponse;
import com.localworker.backend.model.Booking;
import com.localworker.backend.model.Notification;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(
            User recipient,
            Booking booking,
            String title,
            String message,
            String type
    ) {
        Notification notification = new Notification();

        notification.setUser(recipient);
        notification.setBooking(booking);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        return notificationRepository
                .findByUser_EmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUser_EmailAndReadFalse(email);
    }

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository
                .findByIdAndUser_Email(notificationId, email)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> notifications =
                notificationRepository
                        .findByUser_EmailOrderByCreatedAtDesc(email);

        notifications.stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse convertToDTO(Notification notification) {
        Long bookingId = notification.getBooking() != null
                ? notification.getBooking().getId()
                : null;

        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                bookingId,
                notification.getCreatedAt()
        );
    }
}
