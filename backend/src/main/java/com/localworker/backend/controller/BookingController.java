package com.localworker.backend.controller;

import com.localworker.backend.dto.BookingRequest;
import com.localworker.backend.dto.BookingResponse;
import com.localworker.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse createBooking(
            @Valid @RequestBody BookingRequest request) {

        return bookingService.createBooking(request);
    }

    // ADMIN: Get all bookings
    @GetMapping
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // WORKER: Get bookings assigned to the logged-in worker
    @GetMapping("/my")
    public List<BookingResponse> getMyWorkerBookings() {
        return bookingService.getMyWorkerBookings();
    }

    // CUSTOMER: Get bookings belonging to the logged-in customer
    @GetMapping("/my/customer")
    public List<BookingResponse> getMyCustomerBookings() {
        return bookingService.getMyCustomerBookings();
    }

    @GetMapping("/{id}")
    public BookingResponse getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    @PutMapping("/{id}/accept")
    public BookingResponse acceptBooking(@PathVariable Long id) {
        return bookingService.acceptBooking(id);
    }

    @PutMapping("/{id}/reject")
    public BookingResponse rejectBooking(@PathVariable Long id) {
        return bookingService.rejectBooking(id);
    }

    @PutMapping("/{id}/start")
    public BookingResponse startBooking(@PathVariable Long id) {
        return bookingService.startBooking(id);
    }

    @PutMapping("/{id}/complete")
    public BookingResponse completeBooking(@PathVariable Long id) {
        return bookingService.completeBooking(id);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}