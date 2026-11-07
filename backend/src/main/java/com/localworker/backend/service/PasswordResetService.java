
package com.localworker.backend.service;

import com.localworker.backend.model.PasswordResetOtp;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.PasswordResetOtpRepository;
import com.localworker.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 10;

    private static final String GENERIC_MESSAGE =
            "If an account exists with this email, "
                    + "a password reset OTP has been sent.";

    private final PasswordResetOtpRepository resetOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetOtpRepository resetOtpRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.resetOtpRepository = resetOtpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Step 1: Send password reset OTP
    @Transactional
    public String sendPasswordResetOtp(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            return GENERIC_MESSAGE;
        }

        Instant now = Instant.now();

        PasswordResetOtp resetOtp = resetOtpRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(PasswordResetOtp::new);

        // Enforce resend cooldown.
        if (resetOtp.getCreatedAt() != null) {

            Instant nextAllowedTime = resetOtp.getCreatedAt()
                    .plusSeconds(RESEND_COOLDOWN_SECONDS);

            if (now.isBefore(nextAllowedTime)) {
                return GENERIC_MESSAGE;
            }
        }

        String otp = generateOtp();

        resetOtp.setEmail(normalizedEmail);
        resetOtp.setOtpHash(hashValue(otp));
        resetOtp.setOtpExpiry(
                now.plusSeconds(OTP_EXPIRY_MINUTES * 60L)
        );
        resetOtp.setCreatedAt(now);
        resetOtp.setFailedAttempts(0);

        // Invalidate previous reset authorization.
        resetOtp.setResetTokenHash(null);
        resetOtp.setResetTokenExpiry(null);

        resetOtpRepository.save(resetOtp);

        emailService.sendPasswordResetOtpEmail(
                normalizedEmail,
                otp
        );

        return GENERIC_MESSAGE;
    }

    // Step 2: Verify OTP and issue reset authorization
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public String verifyResetOtp(String email, String otp) {

        if (email == null || email.isBlank()
                || otp == null || !otp.matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Invalid or expired OTP."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        PasswordResetOtp resetOtp = resetOtpRepository
                .findByEmailForUpdate(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid or expired OTP."
                        )
                );

        Instant now = Instant.now();

        if (resetOtp.getOtpHash() == null
                || resetOtp.getOtpExpiry() == null
                || !now.isBefore(resetOtp.getOtpExpiry())) {

            resetOtpRepository.delete(resetOtp);

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new one."
            );
        }

        if (resetOtp.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {

            resetOtpRepository.delete(resetOtp);

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        String submittedOtpHash = hashValue(otp);

        boolean otpMatches = MessageDigest.isEqual(
                resetOtp.getOtpHash().getBytes(StandardCharsets.UTF_8),
                submittedOtpHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!otpMatches) {

            int attempts = resetOtp.getFailedAttempts() + 1;
            resetOtp.setFailedAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {

                resetOtpRepository.delete(resetOtp);

                throw new IllegalArgumentException(
                        "Maximum OTP attempts exceeded. Please request a new OTP."
                );
            }

            throw new IllegalArgumentException(
                    "Invalid OTP. Attempts remaining: "
                            + (MAX_FAILED_ATTEMPTS - attempts)
            );
        }

        String resetToken = generateResetToken();

        resetOtp.setResetTokenHash(hashValue(resetToken));

        resetOtp.setResetTokenExpiry(
                now.plusSeconds(
                        RESET_TOKEN_EXPIRY_MINUTES * 60L
                )
        );

        // Consume OTP after successful verification.
        resetOtp.setOtpHash(null);
        resetOtp.setOtpExpiry(null);
        resetOtp.setFailedAttempts(0);

        resetOtpRepository.save(resetOtp);

        return resetToken;
    }

    // Step 3: Update password using reset authorization
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public String resetPassword(
            String email,
            String resetToken,
            String newPassword) {

        if (email == null || email.isBlank()
                || resetToken == null || resetToken.isBlank()
                || newPassword == null || newPassword.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid password reset request."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        PasswordResetOtp resetOtp = resetOtpRepository
                .findByEmailForUpdate(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid or expired reset authorization."
                        )
                );

        Instant now = Instant.now();

        if (resetOtp.getResetTokenHash() == null
                || resetOtp.getResetTokenExpiry() == null
                || !now.isBefore(resetOtp.getResetTokenExpiry())) {

            resetOtpRepository.delete(resetOtp);

            throw new IllegalArgumentException(
                    "Reset authorization has expired. Please start again."
            );
        }

        String submittedTokenHash = hashValue(resetToken);

        boolean tokenMatches = MessageDigest.isEqual(
                resetOtp.getResetTokenHash()
                        .getBytes(StandardCharsets.UTF_8),
                submittedTokenHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!tokenMatches) {
            throw new IllegalArgumentException(
                    "Invalid or expired reset authorization."
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Unable to reset password."
                        )
                );

        // Store the new password using BCrypt.
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete the reset record: authorization is now consumed.
        resetOtpRepository.delete(resetOtp);

        return "Password reset successfully. Please log in with your new password.";
    }

    private String generateOtp() {

        int otpNumber = secureRandom.nextInt(1_000_000);

        return String.format("%06d", otpNumber);
    }

    private String generateResetToken() {

        byte[] tokenBytes = new byte[32];

        secureRandom.nextBytes(tokenBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
    }

    private String hashValue(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to securely hash value.",
                    exception
            );
        }
    }
}
