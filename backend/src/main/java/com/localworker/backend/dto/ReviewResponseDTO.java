package com.localworker.backend.dto;

import java.time.LocalDateTime;

public class ReviewResponseDTO {

    private Long id;
    private Long bookingId;
    private Long customerId;
    private Long workerId;
    private String workerName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponseDTO() {
    }

    public ReviewResponseDTO(
            Long id,
            Long bookingId,
            Long customerId,
            Long workerId,
            String workerName,
            int rating,
            String comment,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.bookingId = bookingId;
        this.customerId = customerId;
        this.workerId = workerId;
        this.workerName = workerName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}