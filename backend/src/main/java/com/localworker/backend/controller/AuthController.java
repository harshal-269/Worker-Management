
package com.localworker.backend.controller;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.OAuthExchangeRequest;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OAuthLoginCodeService oauthLoginCodeService;
    private final RegistrationOtpService registrationOtpService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            AuthService authService,
            OAuthLoginCodeService oauthLoginCodeService,
            RegistrationOtpService registrationOtpService,
            PasswordResetService passwordResetService) {

        this.authService = authService;
        this.oauthLoginCodeService = oauthLoginCodeService;
        this.registrationOtpService = registrationOtpService;
        this.passwordResetService = passwordResetService;
    }

    // Login
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
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

    // Google OAuth code exchange
    @PostMapping("/oauth/exchange")
    public ResponseEntity<LoginResponse> exchangeGoogleCode(
            @RequestBody OAuthExchangeRequest request) {

        LoginResponse response =
                oauthLoginCodeService.exchangeCode(request.getCode());

        return ResponseEntity.ok(response);
    }
}
