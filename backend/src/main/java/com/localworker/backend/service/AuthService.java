package com.localworker.backend.service;

import com.localworker.backend.dto.LoginRequest;
import com.localworker.backend.dto.LoginResponse;
import com.localworker.backend.dto.RegisterRequest;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.CUSTOMER);

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findAllByEmail(request.getEmail())
                .stream()
                .filter(existingUser ->
                        passwordEncoder.matches(
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
                role
        );
    }
}
