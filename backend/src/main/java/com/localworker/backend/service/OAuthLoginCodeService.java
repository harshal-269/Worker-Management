
package com.localworker.backend.service;

import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthLoginCodeService {

    private static final long CODE_EXPIRY_SECONDS = 60;

    private final Map<String, LoginCode> codes = new ConcurrentHashMap<>();

    private final SecureRandom secureRandom = new SecureRandom();

    private final JwtService jwtService;

    private final UserRepository userRepository;

    public OAuthLoginCodeService(
            JwtService jwtService,
            UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Transactional
    public String createCode(User user) {

        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("Invalid OAuth user.");
        }

        // Fetch the user again inside the active database transaction.
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("OAuth user not found."));

        String email = managedUser.getEmail();
        Role role = managedUser.getRole();

        if (email == null || email.isBlank() || role == null) {
            throw new IllegalStateException(
                    "User email or role is missing."
            );
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String code = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        codes.put(
                code,
                new LoginCode(
                        email,
                        role,
                        Instant.now().plusSeconds(CODE_EXPIRY_SECONDS)
                )
        );

        cleanupExpiredCodes();

        return code;
    }

    public LoginResponse exchangeCode(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "OAuth login code is missing."
            );
        }

        // Remove immediately so the code can only be used once.
        LoginCode loginCode = codes.remove(code);

        if (loginCode == null) {
            throw new IllegalArgumentException(
                    "Invalid or already used OAuth login code."
            );
        }

        if (!Instant.now().isBefore(loginCode.expiresAt())) {
            throw new IllegalArgumentException(
                    "OAuth login code has expired."
            );
        }

        String token = jwtService.generateToken(
                loginCode.email(),
                loginCode.role()
        );

        return new LoginResponse(
                token,
                "Google login successful",
                loginCode.role().name()
        );
    }

    private void cleanupExpiredCodes() {

        Instant now = Instant.now();

        codes.entrySet().removeIf(
                entry -> !now.isBefore(entry.getValue().expiresAt())
        );
    }

    private record LoginCode(
            String email,
            Role role,
            Instant expiresAt
    ) {
    }
}
