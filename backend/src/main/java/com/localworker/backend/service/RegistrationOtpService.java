
package com.localworker.backend.service;

import com.localworker.backend.model.PendingRegistration;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.PendingRegistrationRepository;
import com.localworker.backend.repository.UserRepository;
import com.localworker.backend.repository.WorkerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class RegistrationOtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final PendingRegistrationRepository pendingRepository;
    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public RegistrationOtpService(
            PendingRegistrationRepository pendingRepository,
            UserRepository userRepository,
            WorkerRepository workerRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.pendingRepository = pendingRepository;
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Send registration OTP
    @Transactional
    public String sendRegistrationOtp(
            String name,
            String email,
            String phone,
            String password,
            Role role
    ) {

        validateRegistrationDetails(name, email, phone, password, role);

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String normalizedPhone = phone.trim();

        // Check whether email is already registered.
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // Phone number uniqueness is intentionally not checked.
        // Multiple accounts can use the same phone number.

        Instant now = Instant.now();

        PendingRegistration pending = pendingRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(PendingRegistration::new);

        // Enforce resend cooldown.
        if (pending.getEmail() != null
                && pending.getCreatedAt() != null) {

            Instant nextAllowedTime = pending.getCreatedAt()
                    .plusSeconds(RESEND_COOLDOWN_SECONDS);

            if (now.isBefore(nextAllowedTime)) {
                throw new IllegalArgumentException(
                        "Please wait before requesting another OTP."
                );
            }
        }

        String otp = generateOtp();

        pending.setName(name.trim());
        pending.setEmail(normalizedEmail);
        pending.setPhone(normalizedPhone);
        pending.setPassword(passwordEncoder.encode(password));
        pending.setRole(role);
        pending.setOtpHash(hashOtp(otp));

        pending.setOtpExpiry(
                now.plusSeconds(OTP_EXPIRY_MINUTES * 60L)
        );

        pending.setCreatedAt(now);
        pending.setFailedAttempts(0);

        pendingRepository.save(pending);

        // Rollback database changes if email delivery fails.
        emailService.sendOtpEmail(normalizedEmail, otp);

        return "Verification OTP sent successfully.";
    }

    // Verify OTP and create account
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public String verifyRegistrationOtp(String email, String otp) {

        if (email == null || email.isBlank()
                || otp == null || otp.isBlank()) {

            throw new IllegalArgumentException(
                    "Email and OTP are required."
            );
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        PendingRegistration pending = pendingRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No pending registration found. Please register again."
                        )
                );

        Instant now = Instant.now();

        // Check OTP expiry.
        if (!now.isBefore(pending.getOtpExpiry())) {

            pendingRepository.delete(pending);

            throw new IllegalArgumentException(
                    "OTP has expired. Please register again."
            );
        }

        // Check maximum failed attempts.
        if (pending.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {

            pendingRepository.delete(pending);

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please register again."
            );
        }

        String submittedOtpHash = hashOtp(otp.trim());

        boolean otpMatches = MessageDigest.isEqual(
                pending.getOtpHash().getBytes(StandardCharsets.UTF_8),
                submittedOtpHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!otpMatches) {

            int attempts = pending.getFailedAttempts() + 1;
            pending.setFailedAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {

                pendingRepository.delete(pending);

                throw new IllegalArgumentException(
                        "Maximum OTP attempts exceeded. Please register again."
                );
            }

            throw new IllegalArgumentException(
                    "Invalid OTP. Attempts remaining: "
                            + (MAX_FAILED_ATTEMPTS - attempts)
            );
        }

        // Recheck email before creating the account.
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {

            pendingRepository.delete(pending);

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // Phone uniqueness is intentionally not checked.

        User user = new User();

        user.setName(pending.getName());
        user.setEmail(normalizedEmail);
        user.setPhone(pending.getPhone());
        user.setPassword(pending.getPassword());
        user.setRole(pending.getRole());

        User savedUser = userRepository.save(user);

        // Automatically create Worker profile.
        if (savedUser.getRole() == Role.WORKER) {

            Worker worker = new Worker();

            worker.setUser(savedUser);
            worker.setExperience(0);
            worker.setAvailable(false);

            workerRepository.save(worker);
        }

        pendingRepository.delete(pending);

        return "Email verified and account created successfully.";
    }

    // Validate registration details
    private void validateRegistrationDetails(
            String name,
            String email,
            String phone,
            String password,
            Role role
    ) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (phone == null || !phone.trim().matches("\\d{10}")) {
            throw new IllegalArgumentException(
                    "Phone number must contain exactly 10 digits."
            );
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        if (role == null
                || (role != Role.CUSTOMER && role != Role.WORKER)) {

            throw new IllegalArgumentException(
                    "Only Customer and Worker registration is allowed."
            );
        }
    }

    // Generate six-digit OTP
    private String generateOtp() {

        int otpNumber = secureRandom.nextInt(1_000_000);

        return String.format("%06d", otpNumber);
    }

    // Hash OTP using SHA-256
    private String hashOtp(String otp) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    otp.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to hash OTP.",
                    exception
            );
        }
    }
}
