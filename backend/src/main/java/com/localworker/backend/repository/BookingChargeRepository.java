package com.localworker.backend.repository;

import com.localworker.backend.model.BookingCharge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingChargeRepository
        extends JpaRepository<BookingCharge, Long> {

    List<BookingCharge> findByBooking_IdOrderByIdAsc(Long bookingId);

    Optional<BookingCharge> findByIdAndBooking_Id(
            Long chargeId,
            Long bookingId
    );
}