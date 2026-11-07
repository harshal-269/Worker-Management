
package com.localworker.backend.service;

import com.localworker.backend.model.RefreshToken;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private final long refreshTokenExpirationMs;

    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.auth.refresh-token-expiration-ms:604800000}")
            long refreshTokenExpirationMs
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Transactional
    public String createRefreshToken(User user) {

        String rawToken = generateSecureToken();

        RefreshToken refreshToken = new RefreshToken(
                hashToken(rawToken),
                user,
                Instant.now().plusMillis(refreshTokenExpirationMs),
                Instant.now()
        );

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Transactional
    public RotatedRefreshToken rotateRefreshToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is missing.");
        }

        String tokenHash = hashToken(rawToken);

        RefreshToken existingToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid refresh token. Please log in again."
                        )
                );

        if (existingToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(existingToken);

            throw new IllegalArgumentException(
                    "Refresh token has expired. Please log in again."
            );
        }

        User user = existingToken.getUser();

        // Capture user details while the entity is still managed.
        Long userId = user.getId();
        String email = user.getEmail();
        String name = user.getName();
        Role role = user.getRole();

        // Invalidate the old token before issuing a replacement.
        refreshTokenRepository.delete(existingToken);
        refreshTokenRepository.flush();

        String newRawToken = generateSecureToken();

        RefreshToken newRefreshToken = new RefreshToken(
                hashToken(newRawToken),
                user,
                Instant.now().plusMillis(refreshTokenExpirationMs),
                Instant.now()
        );

        refreshTokenRepository.save(newRefreshToken);

        return new RotatedRefreshToken(
                newRawToken,
                userId,
                email,
                name,
                role
        );
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.deleteByTokenHash(
                hashToken(rawToken)
        );
    }

    private String generateSecureToken() {

        byte[] randomBytes = new byte[64];

        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hashedBytes = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hashedBytes);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to hash refresh token.",
                    exception
            );
        }
    }

    public record RotatedRefreshToken(
            String token,
            Long userId,
            String email,
            String name,
            Role role
    ) {
    }
}
