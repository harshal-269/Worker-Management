package com.localworker.backend.controller;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.RegisterRequest;
import com.localworker.backend.model.User;
import com.localworker.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }
}