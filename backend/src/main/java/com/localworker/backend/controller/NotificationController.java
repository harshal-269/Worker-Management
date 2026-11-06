
package com.localworker.backend.controller;

import com.localworker.backend.dto.NotificationResponse;
import com.localworker.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(authentication.getName())
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                Map.of("unreadCount",
                        notificationService.getUnreadCount(authentication.getName()))
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
