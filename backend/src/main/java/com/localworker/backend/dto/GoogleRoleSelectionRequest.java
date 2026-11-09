package com.localworker.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleRoleSelectionRequest {

    @NotBlank(message = "Registration token is required")
    private String registrationToken;

    @NotBlank(message = "Role is required")
    private String role;

    public GoogleRoleSelectionRequest() {
    }

    public String getRegistrationToken() {
        return registrationToken;
    }

    public void setRegistrationToken(String registrationToken) {
        this.registrationToken = registrationToken;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}