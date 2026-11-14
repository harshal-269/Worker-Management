
package com.localworker.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public class WorkerServiceOfferingRequest {

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Price is required")
    @DecimalMin(
            value = "1.00",
            message = "Price must be at least ₹1"
    )
    @Digits(
            integer = 8,
            fraction = 2,
            message = "Price can have at most 2 decimal places"
    )
    private BigDecimal price;

    public WorkerServiceOfferingRequest() {
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
