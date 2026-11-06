package com.localworker.backend.dto;

public class LoginResponse {

    private String token;
    private String message;
    private String role;
    private String email;
    private String name;

    public LoginResponse() {
    }

    public LoginResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    public LoginResponse(String token, String message, String role) {
        this(token, message, role, null, null);
    }

    public LoginResponse(
            String token,
            String message,
            String role,
            String email,
            String name) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.email = email;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
