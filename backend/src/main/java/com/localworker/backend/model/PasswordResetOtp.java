
package com.localworker.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "password_reset_otps",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_password_reset_email",
                        columnNames = "email"
                )
        }
)
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // NULL after successful OTP verification.
    @Column(nullable = true, length = 64)
    private String otpHash;

    private Instant otpExpiry;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private int failedAttempts;

    @Column(length = 64)
    private String resetTokenHash;

    private Instant resetTokenExpiry;

    public PasswordResetOtp() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public Instant getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(Instant otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public String getResetTokenHash() {
        return resetTokenHash;
    }

    public void setResetTokenHash(String resetTokenHash) {
        this.resetTokenHash = resetTokenHash;
    }

    public Instant getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(Instant resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
}
