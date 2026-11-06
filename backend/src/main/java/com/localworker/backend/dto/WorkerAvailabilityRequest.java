package com.localworker.backend.dto;

import jakarta.validation.constraints.NotNull;

public record WorkerAvailabilityRequest(
        @NotNull(message = "Availability is required")
        Boolean available
) {
}
