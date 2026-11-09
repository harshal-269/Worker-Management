
package com.localworker.backend.repository;

import com.localworker.backend.model.PasswordResetOtp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByEmailIgnoreCase(String email);

    @Query(
            value = """
                SELECT *
                FROM password_reset_otps
                WHERE LOWER(email) = LOWER(:email)
                FOR UPDATE
                """,
            nativeQuery = true
    )
    Optional<PasswordResetOtp> findByEmailForUpdate(
            @Param("email") String email
    );

    void deleteByEmailIgnoreCase(String email);
}
