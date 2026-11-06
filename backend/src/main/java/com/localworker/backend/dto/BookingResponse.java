package com.localworker.backend.dto;

import com.localworker.backend.model.BookingStatus;

import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;

    private Long customerId;

    private Long workerId;

    private Long serviceId;

    private String serviceName;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String workerName;
    private String workerEmail;
    private String workerPhone;
    private String workerLocation;
    private Integer workerExperience;

    private LocalDateTime scheduledAt;

    private String address;

    private String problemDescription;

    private BookingStatus status;

    public BookingResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getWorkerEmail() { return workerEmail; }
    public void setWorkerEmail(String workerEmail) { this.workerEmail = workerEmail; }

    public String getWorkerPhone() { return workerPhone; }
    public void setWorkerPhone(String workerPhone) { this.workerPhone = workerPhone; }

    public String getWorkerLocation() { return workerLocation; }
    public void setWorkerLocation(String workerLocation) { this.workerLocation = workerLocation; }

    public Integer getWorkerExperience() { return workerExperience; }
    public void setWorkerExperience(Integer workerExperience) { this.workerExperience = workerExperience; }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}