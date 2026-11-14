
package com.localworker.backend.service;

import com.localworker.backend.dto.BillRejectionRequest;
import com.localworker.backend.dto.BookingBillResponse;
import com.localworker.backend.dto.BookingChargeRequest;
import com.localworker.backend.dto.BookingChargeResponse;

import com.localworker.backend.model.BillingStatus;
import com.localworker.backend.model.Booking;
import com.localworker.backend.model.BookingCharge;
import com.localworker.backend.model.BookingStatus;
import com.localworker.backend.model.Role;

import com.localworker.backend.repository.BookingChargeRepository;
import com.localworker.backend.repository.BookingRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingChargeService {

    private final BookingRepository bookingRepository;
    private final BookingChargeRepository chargeRepository;
    private final NotificationService notificationService;

    public BookingChargeService(
            BookingRepository bookingRepository,
            BookingChargeRepository chargeRepository,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.chargeRepository = chargeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // ADD CHARGE
    // =========================================================

    @Transactional
    public BookingBillResponse addCharge(
            Long bookingId,
            BookingChargeRequest request) {

        Booking booking = getBooking(bookingId);

        authorizeAssignedWorker(booking);
        validateEditableBill(booking);

        BookingCharge charge = new BookingCharge();

        charge.setBooking(booking);
        charge.setName(request.getName().trim());
        charge.setDescription(request.getDescription());
        charge.setAmount(request.getAmount());

        booking.addCharge(charge);

        bookingRepository.save(booking);

        return buildBillResponse(booking);
    }

    // =========================================================
    // UPDATE CHARGE
    // =========================================================

    @Transactional
    public BookingBillResponse updateCharge(
            Long bookingId,
            Long chargeId,
            BookingChargeRequest request) {

        Booking booking = getBooking(bookingId);

        authorizeAssignedWorker(booking);
        validateEditableBill(booking);

        BookingCharge charge = chargeRepository
                .findByIdAndBooking_Id(chargeId, bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Charge not found"));

        charge.setName(request.getName().trim());
        charge.setDescription(request.getDescription());
        charge.setAmount(request.getAmount());

        chargeRepository.save(charge);

        return buildBillResponse(booking);
    }

    // =========================================================
    // DELETE CHARGE
    // =========================================================

    @Transactional
    public BookingBillResponse deleteCharge(
            Long bookingId,
            Long chargeId) {

        Booking booking = getBooking(bookingId);

        authorizeAssignedWorker(booking);
        validateEditableBill(booking);

        BookingCharge charge = chargeRepository
                .findByIdAndBooking_Id(chargeId, bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Charge not found"));

        booking.removeCharge(charge);

        bookingRepository.save(booking);

        return buildBillResponse(booking);
    }

    // =========================================================
    // GET BILL
    // =========================================================

    @Transactional(readOnly = true)
    public BookingBillResponse getBill(Long bookingId) {

        Booking booking = getBooking(bookingId);

        authorizeBillRead(booking);

        return buildBillResponse(booking);
    }

    // =========================================================
    // SUBMIT BILL
    // =========================================================

    @Transactional
    public BookingBillResponse submitBill(Long bookingId) {

        Booking booking = getBooking(bookingId);

        authorizeAssignedWorker(booking);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "The final bill can only be submitted after work is completed");
        }

        if (booking.getBillingStatus() != BillingStatus.DRAFT
                && booking.getBillingStatus() != BillingStatus.REJECTED) {

            throw new IllegalStateException(
                    "Bill cannot be submitted in its current status");
        }

        if (booking.getVisitingCharge() == null) {
            throw new IllegalStateException(
                    "Visiting charge is missing");
        }

        booking.setBillingStatus(BillingStatus.PENDING_APPROVAL);
        booking.setBillSubmittedAt(LocalDateTime.now());
        booking.setBillRejectionReason(null);
        booking.setBillApprovedAt(null);

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                savedBooking.getCustomer(),
                savedBooking,
                "Bill Submitted",
                savedBooking.getWorker().getUser().getName()
                        + " has submitted the final bill for your completed "
                        + savedBooking.getService().getName()
                        + " booking. Please review it.",
                "BILL_SUBMITTED"
        );

        return buildBillResponse(savedBooking);
    }

    // =========================================================
    // CUSTOMER APPROVES BILL
    // =========================================================

    @Transactional
    public BookingBillResponse approveBill(Long bookingId) {

        Booking booking = getBooking(bookingId);

        authorizeCustomer(booking);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only bills for completed bookings can be reviewed");
        }

        if (booking.getBillingStatus()
                != BillingStatus.PENDING_APPROVAL) {

            throw new IllegalStateException(
                    "Only pending bills can be approved");
        }

        booking.setBillingStatus(BillingStatus.APPROVED);
        booking.setBillApprovedAt(LocalDateTime.now());
        booking.setBillRejectionReason(null);

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                savedBooking.getWorker().getUser(),
                savedBooking,
                "Bill Approved",
                savedBooking.getCustomer().getName()
                        + " has approved the final bill for your completed "
                        + savedBooking.getService().getName() + " booking.",
                "BILL_APPROVED"
        );

        return buildBillResponse(savedBooking);
    }

    // =========================================================
    // CUSTOMER REJECTS BILL
    // =========================================================

    @Transactional
    public BookingBillResponse rejectBill(
            Long bookingId,
            BillRejectionRequest request) {

        Booking booking = getBooking(bookingId);

        authorizeCustomer(booking);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only bills for completed bookings can be reviewed");
        }

        if (booking.getBillingStatus()
                != BillingStatus.PENDING_APPROVAL) {

            throw new IllegalStateException(
                    "Only pending bills can be rejected");
        }

        if (request.getReason() == null
                || request.getReason().isBlank()) {

            throw new IllegalArgumentException(
                    "Rejection reason is required");
        }

        String reason = request.getReason().trim();

        booking.setBillingStatus(BillingStatus.REJECTED);
        booking.setBillRejectionReason(reason);
        booking.setBillApprovedAt(null);

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                savedBooking.getWorker().getUser(),
                savedBooking,
                "Bill Rejected",
                savedBooking.getCustomer().getName()
                        + " has rejected your bill. Reason: " + reason,
                "BILL_REJECTED"
        );

        return buildBillResponse(savedBooking);
    }

    // =========================================================
    // BUILD BILL RESPONSE
    // =========================================================

    private BookingBillResponse buildBillResponse(Booking booking) {

        List<BookingChargeResponse> charges =
                booking.getCharges()
                        .stream()
                        .map(charge -> new BookingChargeResponse(
                                charge.getId(),
                                charge.getName(),
                                charge.getDescription(),
                                charge.getAmount(),
                                charge.getCreatedAt(),
                                charge.getUpdatedAt()
                        ))
                        .toList();

        BigDecimal additionalChargesTotal =
                charges.stream()
                        .map(BookingChargeResponse::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal visitingCharge =
                booking.getVisitingCharge() != null
                        ? booking.getVisitingCharge()
                        : BigDecimal.ZERO;

        BigDecimal totalAmount =
                visitingCharge.add(additionalChargesTotal);

        return new BookingBillResponse(
                booking.getId(),
                visitingCharge,
                charges,
                additionalChargesTotal,
                totalAmount,
                booking.getBillingStatus(),
                booking.getBillRejectionReason(),
                booking.getBillSubmittedAt(),
                booking.getBillApprovedAt()
        );
    }

    // =========================================================
    // BOOKING HELPERS
    // =========================================================

    private Booking getBooking(Long bookingId) {

        return bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));
    }

    private void validateEditableBill(Booking booking) {

        if (booking.getStatus() != BookingStatus.IN_PROGRESS
                && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Charges can only be edited while work is in progress or after completion");
        }

        if (booking.getBillingStatus() != BillingStatus.DRAFT
                && booking.getBillingStatus() != BillingStatus.REJECTED) {

            throw new IllegalStateException(
                    "Charges cannot be edited in the current billing status");
        }
    }

    // =========================================================
    // AUTHENTICATION HELPERS
    // =========================================================

    private String getCurrentUserEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required");
        }

        return authentication.getName();
    }

    private boolean hasRole(Role role) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        String expectedAuthority = "ROLE_" + role.name();

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(expectedAuthority::equals);
    }

    // =========================================================
    // AUTHORIZATION HELPERS
    // =========================================================

    private void authorizeAssignedWorker(Booking booking) {

        if (!hasRole(Role.WORKER)) {
            throw new AccessDeniedException(
                    "Only workers can manage charges");
        }

        String email = getCurrentUserEmail();

        String assignedWorkerEmail =
                booking.getWorker().getUser().getEmail();

        if (!assignedWorkerEmail.equalsIgnoreCase(email)) {
            throw new AccessDeniedException(
                    "You can manage charges only for your assigned bookings");
        }
    }

    private void authorizeCustomer(Booking booking) {

        if (!hasRole(Role.CUSTOMER)) {
            throw new AccessDeniedException(
                    "Only customers can approve or reject bills");
        }

        String email = getCurrentUserEmail();

        String customerEmail =
                booking.getCustomer().getEmail();

        if (!customerEmail.equalsIgnoreCase(email)) {
            throw new AccessDeniedException(
                    "You can approve or reject only your own bills");
        }
    }

    private void authorizeBillRead(Booking booking) {

        if (hasRole(Role.ADMIN)) {
            return;
        }

        String email = getCurrentUserEmail();

        boolean isCustomer =
                hasRole(Role.CUSTOMER)
                        && booking.getCustomer().getEmail()
                        .equalsIgnoreCase(email);

        boolean isAssignedWorker =
                hasRole(Role.WORKER)
                        && booking.getWorker().getUser().getEmail()
                        .equalsIgnoreCase(email);

        if (!isCustomer && !isAssignedWorker) {
            throw new AccessDeniedException(
                    "You cannot view this bill");
        }
    }
}
