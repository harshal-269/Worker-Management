
package com.localworker.backend.repository;

import com.localworker.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_EmailOrderByCreatedAtDesc(String email);

    long countByUser_EmailAndReadFalse(String email);

    Optional<Notification> findByIdAndUser_Email(Long id, String email);

}
