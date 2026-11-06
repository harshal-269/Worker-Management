
package com.localworker.backend.repository;

import com.localworker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Existing methods used by other services
    Optional<User> findByEmail(String email);

    List<User> findAllByEmail(String email);

    boolean existsByEmail(String email);

    // Case-insensitive methods for Google authentication
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
