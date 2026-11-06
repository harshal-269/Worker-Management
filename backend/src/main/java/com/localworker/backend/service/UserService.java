package com.localworker.backend.service;

import com.localworker.backend.model.User;
import com.localworker.backend.model.Role;
import com.localworker.backend.dto.CustomerProfileDTO;
import com.localworker.backend.dto.UpdateCustomerProfileRequest;
import org.springframework.security.access.AccessDeniedException;
import com.localworker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Transactional(readOnly = true)
    public CustomerProfileDTO getCurrentUserProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toProfileDTO(user);
    }

    @Transactional
    public CustomerProfileDTO updateCurrentUserProfile(
            String email,
            UpdateCustomerProfileRequest request) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only customers can update this profile");
        }

        user.setName(request.getName().trim());
        user.setPhone(
                request.getPhone() == null || request.getPhone().isBlank()
                        ? null
                        : request.getPhone().trim()
        );

        return toProfileDTO(userRepository.save(user));
    }

    private CustomerProfileDTO toProfileDTO(User user) {
        return new CustomerProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPassword(updatedUser.getPassword());

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(existingUser);
    }
}