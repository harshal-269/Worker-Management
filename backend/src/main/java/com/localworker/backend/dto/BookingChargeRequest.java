package com.localworker.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class BookingChargeRequest {

    @NotBlank(message = "Charge name is required")
    @Size(max = 150, message = "Charge name cannot exceed 150 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Charge amount is required")
    @DecimalMin(value = "0.01", message = "Charge amount must be greater than zero")
    @Digits(
            integer = 8,
            fraction = 2,
            message = "Amount can have at most 2 decimal places"
    )
    private BigDecimal amount;

    public BookingChargeRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}