package com.localworker.backend.controller;

import com.localworker.backend.model.User;
import com.localworker.backend.dto.CustomerProfileDTO;
import com.localworker.backend.dto.UpdateCustomerProfileRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.localworker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerProfileDTO> getMyProfile(
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.getCurrentUserProfile(authentication.getName())
        );
    }

    @PutMapping("/me")
    public ResponseEntity<CustomerProfileDTO> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCustomerProfileRequest request) {
        return ResponseEntity.ok(
                userService.updateCurrentUserProfile(
                        authentication.getName(), request)
        );
    }

    @PostMapping
    public User createUser(@Valid @RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @Valid @RequestBody User user) {

        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return "User deleted successfully";
    }
}