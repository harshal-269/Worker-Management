
package com.localworker.backend.controller;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.RegisterRequest;
import com.localworker.backend.dto.OAuthExchangeRequest;
import com.localworker.backend.model.User;
import com.localworker.backend.service.AuthService;
import com.localworker.backend.service.OAuthLoginCodeService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OAuthLoginCodeService oauthLoginCodeService;

    public AuthController(
            AuthService authService,
            OAuthLoginCodeService oauthLoginCodeService) {

        this.authService = authService;
        this.oauthLoginCodeService = oauthLoginCodeService;
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

    @PostMapping("/oauth/exchange")
    public ResponseEntity<LoginResponse> exchangeGoogleCode(
            @RequestBody OAuthExchangeRequest request) {

        LoginResponse response =
                oauthLoginCodeService.exchangeCode(request.getCode());

        return ResponseEntity.ok(response);
    }
}
