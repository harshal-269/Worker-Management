
package com.localworker.backend.controller;

import com.localworker.backend.dto.BookingRequest;
import com.localworker.backend.dto.BookingResponse;
import com.localworker.backend.dto.BookingStatusReasonRequest;
import com.localworker.backend.dto.BookingChargeRequest;
import com.localworker.backend.dto.BookingChargeResponse;
import com.localworker.backend.dto.BookingBillResponse;
import com.localworker.backend.dto.BillRejectionRequest;

import com.localworker.backend.service.BookingService;
import com.localworker.backend.service.BookingChargeService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingChargeService bookingChargeService;

    public BookingController(
            BookingService bookingService,
            BookingChargeService bookingChargeService) {

        this.bookingService = bookingService;
        this.bookingChargeService = bookingChargeService;
    }

    // =========================================================
    // BOOKING ENDPOINTS
    // =========================================================

    // CUSTOMER: Create a booking
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
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

    // CUSTOMER / ASSIGNED WORKER / ADMIN: Get booking details
    @GetMapping("/{id}")
    public BookingResponse getBookingById(
            @PathVariable Long id) {

        return bookingService.getBookingById(id);
    }

    // WORKER: Accept booking
    @PutMapping("/{id}/accept")
    public BookingResponse acceptBooking(
            @PathVariable Long id) {

        return bookingService.acceptBooking(id);
    }

    // WORKER: Reject booking
    @PutMapping("/{id}/reject")
    public BookingResponse rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusReasonRequest request) {

        return bookingService.rejectBooking(
                id,
                request.getReason()
        );
    }

    // WORKER: Start work after bill approval
    @PutMapping("/{id}/start")
    public BookingResponse startBooking(
            @PathVariable Long id) {

        return bookingService.startBooking(id);
    }

    // WORKER: Mark work as completed
    @PutMapping("/{id}/complete")
    public BookingResponse completeBooking(
            @PathVariable Long id) {

        return bookingService.completeBooking(id);
    }

    // CUSTOMER: Cancel booking
    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusReasonRequest request) {

        return bookingService.cancelBooking(
                id,
                request.getReason()
        );
    }

    // =========================================================
    // BILL VIEW ENDPOINT
    // =========================================================

    // CUSTOMER / ASSIGNED WORKER / ADMIN: View booking bill
    @GetMapping("/{id}/bill")
    public BookingBillResponse getBill(
            @PathVariable Long id) {

        return bookingChargeService.getBill(id);
    }

    // =========================================================
    // CHARGE MANAGEMENT ENDPOINTS
    // =========================================================

    // WORKER: Add a charge item
    @PostMapping("/{id}/charges")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingBillResponse addCharge(
            @PathVariable Long id,
            @Valid @RequestBody BookingChargeRequest request) {

        return bookingChargeService.addCharge(id, request);
    }

    // WORKER: Update an existing charge item
    @PutMapping("/{id}/charges/{chargeId}")
    public BookingBillResponse updateCharge(
            @PathVariable Long id,
            @PathVariable Long chargeId,
            @Valid @RequestBody BookingChargeRequest request) {

        return bookingChargeService.updateCharge(
                id,
                chargeId,
                request
        );
    }

    // WORKER: Delete a charge item
    @DeleteMapping("/{id}/charges/{chargeId}")
    public BookingBillResponse deleteCharge(
            @PathVariable Long id,
            @PathVariable Long chargeId) {

        return bookingChargeService.deleteCharge(
                id,
                chargeId
        );
    }

    // =========================================================
    // BILL SUBMISSION AND APPROVAL ENDPOINTS
    // =========================================================

    // WORKER: Submit bill for customer approval
    @PostMapping("/{id}/bill/submit")
    public BookingBillResponse submitBill(
            @PathVariable Long id) {

        return bookingChargeService.submitBill(id);
    }

    // CUSTOMER: Approve submitted bill
    @PutMapping("/{id}/bill/approve")
    public BookingBillResponse approveBill(
            @PathVariable Long id) {

        return bookingChargeService.approveBill(id);
    }

    // CUSTOMER: Reject submitted bill with a reason
    @PutMapping("/{id}/bill/reject")
    public BookingBillResponse rejectBill(
            @PathVariable Long id,
            @Valid @RequestBody BillRejectionRequest request) {

        return bookingChargeService.rejectBill(
                id,
                request
        );
    }
}
