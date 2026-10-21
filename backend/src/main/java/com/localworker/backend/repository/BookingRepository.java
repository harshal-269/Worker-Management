package com.localworker.backend.repository;

import com.localworker.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Fetch bookings assigned to a specific worker
    List<Booking> findByWorker_Id(Long workerId);

    // Fetch bookings created by a specific customer
    List<Booking> findByCustomer_Id(Long customerId);
}