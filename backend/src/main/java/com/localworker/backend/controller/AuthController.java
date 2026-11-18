package com.localworker.backend.controller;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.OAuthExchangeRequest;
import com.localworker.backend.dto.GoogleRoleSelectionRequest;
import com.localworker.backend.dto.SendRegistrationOtpRequest;
import com.localworker.backend.dto.VerifyRegistrationOtpRequest;
import com.localworker.backend.dto.ForgotPasswordRequest;
import com.localworker.backend.dto.VerifyResetOtpRequest;
import com.localworker.backend.dto.ResetPasswordRequest;

import com.localworker.backend.service.AuthService;
import com.localworker.backend.service.OAuthLoginCodeService;
import com.localworker.backend.service.RegistrationOtpService;
import com.localworker.backend.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

import com.localworker.backend.model.Role;
import com.localworker.backend.service.JwtService;
import com.localworker.backend.service.RefreshTokenService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OAuthLoginCodeService oauthLoginCodeService;
    private final RegistrationOtpService registrationOtpService;
    private final PasswordResetService passwordResetService;


    @Value("${app.auth.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            OAuthLoginCodeService oauthLoginCodeService,
            RegistrationOtpService registrationOtpService,
            PasswordResetService passwordResetService,
            RefreshTokenService refreshTokenService,
            JwtService jwtService) {

        this.authService = authService;
        this.oauthLoginCodeService = oauthLoginCodeService;
        this.registrationOtpService = registrationOtpService;
        this.passwordResetService = passwordResetService;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthService.LoginResult result = authService.login(request);

        ResponseCookie refreshCookie = ResponseCookie
                .from("refreshToken", result.refreshToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(result.response());
    }
    // Refresh access token using HttpOnly refresh cookie
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false)
            String refreshToken) {

        RefreshTokenService.RotatedRefreshToken rotated =
                refreshTokenService.rotateRefreshToken(refreshToken);

        String accessToken = jwtService.generateToken(
                rotated.email(),
                rotated.role()
        );

        LoginResponse response = new LoginResponse(
                accessToken,
                "Token refreshed successfully",
                rotated.role().name(),
                rotated.email(),
                rotated.name()
        );

        ResponseCookie refreshCookie = createRefreshCookie(
                rotated.token(),
                Duration.ofMillis(refreshTokenExpirationMs)
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    // Logout and revoke refresh token
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @CookieValue(name = "refreshToken", required = false)
            String refreshToken) {

        refreshTokenService.revokeRefreshToken(refreshToken);

        ResponseCookie clearCookie = createRefreshCookie(
                "",
                Duration.ZERO
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body("Logged out successfully");
    }


    // Send registration OTP
    @PostMapping("/register/send-otp")
    public ResponseEntity<String> sendRegistrationOtp(
            @Valid @RequestBody SendRegistrationOtpRequest request) {

        String message = registrationOtpService.sendRegistrationOtp(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                request.getRole()
        );

        return ResponseEntity.ok(message);
    }

    // Verify registration OTP and create account
    @PostMapping("/register/verify-otp")
    public ResponseEntity<String> verifyRegistrationOtp(
            @Valid @RequestBody VerifyRegistrationOtpRequest request) {

        String message = registrationOtpService.verifyRegistrationOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(message);
    }

    // Send password reset OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        String message = passwordResetService.sendPasswordResetOtp(
                request.getEmail()
        );

        return ResponseEntity.ok(message);
    }

    // Verify password reset OTP
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<String> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        String resetToken = passwordResetService.verifyResetOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(resetToken);
    }

    // Reset password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        String message = passwordResetService.resetPassword(
                request.getEmail(),
                request.getResetToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(message);
    }

    // Exchange Google OAuth code
    @PostMapping("/oauth/exchange")
    public ResponseEntity<LoginResponse> exchangeGoogleCode(
            @RequestBody OAuthExchangeRequest request) {

        LoginResponse response =
                oauthLoginCodeService.exchangeCode(request.getCode());

        return ResponseEntity.ok(response);
    }

    // Complete new Google registration after role selection
    @PostMapping("/oauth/register")
    public ResponseEntity<LoginResponse> completeGoogleRegistration(
            @Valid @RequestBody GoogleRoleSelectionRequest request) {

        LoginResponse response =
                oauthLoginCodeService.completeRegistration(
                        request.getRegistrationToken(),
                        request.getRole()
                );

        return ResponseEntity.ok(response);
    }


    private ResponseCookie createRefreshCookie(
            String token,
            Duration maxAge) {

        return ResponseCookie
                .from("refreshToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
    }
}