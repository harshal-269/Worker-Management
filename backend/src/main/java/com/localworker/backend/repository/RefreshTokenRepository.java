
package com.localworker.backend.repository;

import com.localworker.backend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUser_Id(Long userId);

    void deleteByTokenHash(String tokenHash);

    void deleteAllByUser_Id(Long userId);
}
