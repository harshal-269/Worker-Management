package com.localworker.backend.repository;

import com.localworker.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Get all reviews for a particular worker
    List<Review> findByWorkerId(Long workerId);

    // Check whether a customer has already reviewed a booking
    boolean existsByBookingIdAndCustomerId(
            Long bookingId,
            Long customerId
    );

    // Calculate the average rating of a worker
    @Query("""
            SELECT AVG(r.rating)
            FROM Review r
            WHERE r.worker.id = :workerId
            """)
    Double calculateAverageRating(
            @Param("workerId") Long workerId
    );

    // Count reviews for a worker
    long countByWorkerId(Long workerId);
}