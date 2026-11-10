package com.localworker.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkerProfileUpdateRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100,
                message = "Name must contain 2 to 100 characters")
        String name,

        @NotBlank(message = "Location is required")
        @Size(max = 150,
                message = "Location cannot exceed 150 characters")
        String location,

        @Min(value = 0,
                message = "Experience cannot be negative")
        @Max(value = 60,
                message = "Experience cannot exceed 60 years")
        int experience,

        @NotBlank(message = "Professional description is required")
        @Size(max = 1000,
                message = "Description cannot exceed 1000 characters")
        String description

) {
}