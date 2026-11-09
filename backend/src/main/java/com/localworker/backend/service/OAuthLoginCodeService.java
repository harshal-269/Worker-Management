package com.localworker.backend.service;

import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.model.OAuthAccount;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.OAuthAccountRepository;
import com.localworker.backend.repository.UserRepository;
import com.localworker.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthLoginCodeService {

    private static final long CODE_EXPIRY_SECONDS = 60;
    private static final long REGISTRATION_TOKEN_EXPIRY_SECONDS = 300;

    private final Map<String, LoginCode> codes = new ConcurrentHashMap<>();
    private final Map<String, PendingRegistration> pendingRegistrations =
            new ConcurrentHashMap<>();

    private final SecureRandom secureRandom = new SecureRandom();

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final WorkerRepository workerRepository;

    public OAuthLoginCodeService(
            JwtService jwtService,
            UserRepository userRepository,
            OAuthAccountRepository oauthAccountRepository,
            WorkerRepository workerRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.oauthAccountRepository = oauthAccountRepository;
        this.workerRepository = workerRepository;
    }

    // Generate a one-time code after successful Google authentication.
    public String createCode(
            GoogleAuthService.GoogleUserResult googleUser) {

        if (googleUser == null
                || googleUser.email() == null
                || googleUser.email().isBlank()
                || googleUser.googleId() == null
                || googleUser.googleId().isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid Google user information."
            );
        }

        if (googleUser.existingUser() && googleUser.role() == null) {
            throw new IllegalStateException(
                    "Existing Google account has no role."
            );
        }

        String code = generateSecureToken();

        codes.put(
                code,
                new LoginCode(
                        googleUser.email(),
                        googleUser.name(),
                        googleUser.googleId(),
                        googleUser.existingUser() ? googleUser.role() : null,
                        Instant.now().plusSeconds(CODE_EXPIRY_SECONDS)
                )
        );

        cleanupExpiredEntries();

        return code;
    }

    // Exchange the one-time OAuth code.
    public LoginResponse exchangeCode(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "OAuth login code is missing."
            );
        }

        // Remove immediately to prevent reuse.
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

        // Existing account: issue normal JWT.
        if (loginCode.role() != null) {

            User user = userRepository.findByEmailIgnoreCase(
                    loginCode.email()
            ).orElseThrow(() ->
                    new IllegalArgumentException(
                            "Google user account not found."
                    )
            );

            // Use the current database role, not a client-provided role.
            Role currentRole = user.getRole();

            if (currentRole == null) {
                throw new IllegalStateException(
                        "User account has no assigned role."
                );
            }

            String token = jwtService.generateToken(
                    user.getEmail(),
                    currentRole
            );

            return new LoginResponse(
                    token,
                    "Google login successful",
                    currentRole.name(),
                    user.getEmail(),
                    user.getName()
            );
        }

        // New account: create a short-lived registration token.
        String registrationToken = generateSecureToken();

        pendingRegistrations.put(
                registrationToken,
                new PendingRegistration(
                        loginCode.googleId(),
                        loginCode.email(),
                        loginCode.name(),
                        Instant.now().plusSeconds(
                                REGISTRATION_TOKEN_EXPIRY_SECONDS
                        )
                )
        );

        cleanupExpiredEntries();

        LoginResponse response = new LoginResponse();
        response.setMessage("Please select your account type.");
        response.setEmail(loginCode.email());
        response.setName(loginCode.name());
        response.setRequiresRoleSelection(true);
        response.setRegistrationToken(registrationToken);

        return response;
    }

    // Complete registration after the user selects CUSTOMER or WORKER.
    @Transactional
    public LoginResponse completeRegistration(
            String registrationToken,
            String requestedRole) {

        if (registrationToken == null || registrationToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Registration token is missing."
            );
        }

        PendingRegistration pending =
                pendingRegistrations.get(registrationToken);

        if (!pendingRegistrations.remove(registrationToken, pending)) {
            throw new IllegalArgumentException(
                    "Registration token has already been used."
            );
        }

        if (pending == null) {
            throw new IllegalArgumentException(
                    "Invalid or already used registration token."
            );
        }

        if (!Instant.now().isBefore(pending.expiresAt())) {
            throw new IllegalArgumentException(
                    "Registration token has expired. Please sign in again."
            );
        }

        if (requestedRole == null || requestedRole.isBlank()) {
            throw new IllegalArgumentException(
                    "Please select CUSTOMER or WORKER."
            );
        }

        Role selectedRole;

        try {
            selectedRole = Role.valueOf(
                    requestedRole.trim().toUpperCase(Locale.ROOT)
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid role. Choose CUSTOMER or WORKER."
            );
        }

        // Never allow Google self-registration as ADMIN.
        if (selectedRole != Role.CUSTOMER
                && selectedRole != Role.WORKER) {

            throw new IllegalArgumentException(
                    "Only CUSTOMER and WORKER registration is allowed."
            );
        }

        // Recheck email to avoid duplicate accounts.
        if (userRepository.findByEmailIgnoreCase(pending.email()).isPresent()) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. Please sign in."
            );
        }

        User user = new User();

        user.setName(pending.name());
        user.setEmail(pending.email());
        user.setPhone(null);
        user.setPassword(null);
        user.setRole(selectedRole);

        User savedUser = userRepository.save(user);

        // Link the Google identity to the newly created user.
        OAuthAccount oauthAccount = new OAuthAccount(
                "GOOGLE",
                pending.googleId(),
                savedUser
        );

        oauthAccountRepository.save(oauthAccount);

        // Create an initial worker profile for WORKER accounts.
        if (selectedRole == Role.WORKER) {

            Worker worker = new Worker();

            worker.setUser(savedUser);
            worker.setLocation(null);
            worker.setExperience(0);
            worker.setDescription(null);
            worker.setAvailable(false);

            workerRepository.save(worker);
        }

        String jwt = jwtService.generateToken(
                savedUser.getEmail(),
                selectedRole
        );

        return new LoginResponse(
                jwt,
                "Google registration successful",
                selectedRole.name(),
                savedUser.getEmail(),
                savedUser.getName()
        );
    }

    private String generateSecureToken() {

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private void cleanupExpiredEntries() {

        Instant now = Instant.now();

        codes.entrySet().removeIf(
                entry -> !now.isBefore(entry.getValue().expiresAt())
        );

        pendingRegistrations.entrySet().removeIf(
                entry -> !now.isBefore(entry.getValue().expiresAt())
        );
    }

    private record LoginCode(
            String email,
            String name,
            String googleId,
            Role role,
            Instant expiresAt
    ) {
    }

    private record PendingRegistration(
            String googleId,
            String email,
            String name,
            Instant expiresAt
    ) {
    }
}