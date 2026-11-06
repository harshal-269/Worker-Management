
package com.localworker.backend.service;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.RegisterRequest;
import com.localworker.backend.dto.RegisterResponse;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.UserRepository;
import com.localworker.backend.repository.WorkerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            WorkerRepository workerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("Email already registered");
        }

        Role requestedRole = request.getRole();

        if (requestedRole == null) {
            requestedRole = Role.CUSTOMER;
        }

        // Public registration must never create ADMIN accounts.
        if (requestedRole == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Admin registration is not allowed"
            );
        }

        if (requestedRole != Role.CUSTOMER
                && requestedRole != Role.WORKER) {
            throw new IllegalArgumentException("Invalid registration role");
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(requestedRole);

        User savedUser = userRepository.save(user);

        // Automatically create a worker profile.
        if (requestedRole == Role.WORKER) {

            Worker worker = new Worker();

            worker.setUser(savedUser);
            worker.setExperience(0);
            worker.setAvailable(false);

            workerRepository.save(worker);
        }

        return new RegisterResponse(
                "Registration successful",
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findAllByEmail(request.getEmail())
                .stream()
                .filter(existingUser ->
                        existingUser.getPassword() != null
                                && passwordEncoder.matches(
                                request.getPassword(),
                                existingUser.getPassword()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        String role = user.getRole().name();

        return new LoginResponse(
                token,
                "Login successful",
                role,
                user.getEmail(),
                user.getName()
        );
    }
}
