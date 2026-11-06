
package com.localworker.backend.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private Long bookingId;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(
            Long id,
            String title,
            String message,
            String type,
            boolean read,
            Long bookingId,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.bookingId = bookingId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
