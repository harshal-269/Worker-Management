package com.localworker.backend.repository;

import com.localworker.backend.model.Worker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    // Search workers by their user's name
    @Query("""
            SELECT w FROM Worker w
            JOIN w.user u
            WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))
            """)
    Page<Worker> searchByName(
            @Param("name") String name,
            Pageable pageable
    );

    // Filter workers by location
    Page<Worker> findByLocationContainingIgnoreCase(
            String location,
            Pageable pageable
    );

    // Filter workers by minimum experience
    Page<Worker> findByExperienceGreaterThanEqual(
            int experience,
            Pageable pageable
    );

    // Filter workers by availability
    Page<Worker> findByAvailable(
            boolean available,
            Pageable pageable
    );

    Optional<Worker> findByUser_Email(String email);
}