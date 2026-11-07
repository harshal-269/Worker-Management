
package com.localworker.backend.service;

import com.localworker.backend.dto.BookingRequest;
import com.localworker.backend.dto.BookingResponse;
import com.localworker.backend.model.Booking;
import com.localworker.backend.model.BookingStatus;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.Service;
import com.localworker.backend.model.User;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.BookingRepository;
import com.localworker.backend.repository.ServiceRepository;
import com.localworker.backend.repository.UserRepository;
import com.localworker.backend.repository.WorkerRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            WorkerRepository workerRepository,
            ServiceRepository serviceRepository,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.serviceRepository = serviceRepository;
        this.notificationService = notificationService;
    }

    // Create a booking as the authenticated CUSTOMER
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {

        requireRole(Role.CUSTOMER);

        String email = getCurrentUserEmail();

        User customer = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer account not found"));

        if (customer.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException(
                    "Only customers can create bookings"
            );
        }

        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() ->
                        new RuntimeException("Service not found"));

        Booking booking = new Booking();

        booking.setScheduledAt(request.getScheduledAt());
        booking.setAddress(request.getAddress());
        booking.setProblemDescription(request.getProblemDescription());

        booking.setCustomer(customer);
        booking.setWorker(worker);
        booking.setService(service);

        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify the assigned worker.
        notificationService.createNotification(
                worker.getUser(),
                savedBooking,
                "New Booking Request",
                customer.getName() + " has requested your "
                        + service.getName() + " service.",
                "BOOKING_CREATED"
        );

        return convertToResponse(savedBooking);
    }

    // Only ADMIN can view every booking
    public List<BookingResponse> getAllBookings() {

        requireRole(Role.ADMIN);

        return bookingRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // A customer can view their own booking.
    // An assigned worker or ADMIN can also view it.
    public BookingResponse getBookingById(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeBookingRead(booking);

        return convertToResponse(booking);
    }

    // Only the assigned worker or ADMIN can accept a booking
    @Transactional
    public BookingResponse acceptBooking(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeAssignedWorkerOrAdmin(booking);

        validateStatus(
                booking,
                BookingStatus.PENDING,
                "Only PENDING bookings can be accepted"
        );

        booking.setStatus(BookingStatus.ACCEPTED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify the customer.
        notificationService.createNotification(
                booking.getCustomer(),
                savedBooking,
                "Booking Accepted",
                booking.getWorker().getUser().getName()
                        + " has accepted your booking for "
                        + booking.getService().getName() + " service.",
                "BOOKING_ACCEPTED"
        );

        return convertToResponse(savedBooking);
    }

    // Only the assigned worker or ADMIN can reject a booking
    @Transactional
    public BookingResponse rejectBooking(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeAssignedWorkerOrAdmin(booking);

        validateStatus(
                booking,
                BookingStatus.PENDING,
                "Only PENDING bookings can be rejected"
        );

        booking.setStatus(BookingStatus.REJECTED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify the customer.
        notificationService.createNotification(
                booking.getCustomer(),
                savedBooking,
                "Booking Rejected",
                booking.getWorker().getUser().getName()
                        + " has rejected your booking for "
                        + booking.getService().getName() + " service.",
                "BOOKING_REJECTED"
        );

        return convertToResponse(savedBooking);
    }

    // Only the assigned worker or ADMIN can start a booking
    @Transactional
    public BookingResponse startBooking(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeAssignedWorkerOrAdmin(booking);

        validateStatus(
                booking,
                BookingStatus.ACCEPTED,
                "Only ACCEPTED bookings can be started"
        );

        booking.setStatus(BookingStatus.IN_PROGRESS);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify the customer.
        notificationService.createNotification(
                booking.getCustomer(),
                savedBooking,
                "Work Started",
                booking.getWorker().getUser().getName()
                        + " has started your "
                        + booking.getService().getName() + " service.",
                "BOOKING_STARTED"
        );

        return convertToResponse(savedBooking);
    }

    // Only the assigned worker or ADMIN can complete a booking
    @Transactional
    public BookingResponse completeBooking(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeAssignedWorkerOrAdmin(booking);

        validateStatus(
                booking,
                BookingStatus.IN_PROGRESS,
                "Only IN_PROGRESS bookings can be completed"
        );

        booking.setStatus(BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify the customer.
        notificationService.createNotification(
                booking.getCustomer(),
                savedBooking,
                "Work Completed",
                booking.getWorker().getUser().getName()
                        + " has completed your "
                        + booking.getService().getName() + " service.",
                "BOOKING_COMPLETED"
        );

        return convertToResponse(savedBooking);
    }

    // Only the customer who owns the booking or ADMIN can cancel it
    @Transactional
    public BookingResponse cancelBooking(Long id) {

        Booking booking = getBookingEntity(id);

        authorizeCustomerOrAdmin(booking);

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.ACCEPTED) {

            throw new IllegalStateException(
                    "Only PENDING or ACCEPTED bookings can be cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify the assigned worker.
        notificationService.createNotification(
                booking.getWorker().getUser(),
                savedBooking,
                "Booking Cancelled",
                booking.getCustomer().getName()
                        + " has cancelled the booking for "
                        + booking.getService().getName() + " service.",
                "BOOKING_CANCELLED"
        );

        return convertToResponse(savedBooking);
    }

    // Get the authenticated user's email from the JWT security context
    private String getCurrentUserEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        return authentication.getName();
    }

    // Check whether the authenticated user has a particular role
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

    private boolean isAdmin() {
        return hasRole(Role.ADMIN);
    }

    private void requireRole(Role role) {

        if (!hasRole(role)) {
            throw new AccessDeniedException(
                    "You are not authorized to perform this operation"
            );
        }
    }

    // Authorize access to a specific booking
    private void authorizeBookingRead(Booking booking) {

        if (isAdmin()) {
            return;
        }

        String email = getCurrentUserEmail();

        boolean isCustomer =
                booking.getCustomer()
                        .getEmail()
                        .equalsIgnoreCase(email);

        boolean isAssignedWorker =
                booking.getWorker()
                        .getUser()
                        .getEmail()
                        .equalsIgnoreCase(email);

        if (!isCustomer && !isAssignedWorker) {
            throw new AccessDeniedException(
                    "You cannot view this booking"
            );
        }
    }

    // Only the worker assigned to this booking or ADMIN
    private void authorizeAssignedWorkerOrAdmin(Booking booking) {

        if (isAdmin()) {
            return;
        }

        requireRole(Role.WORKER);

        String email = getCurrentUserEmail();

        String assignedWorkerEmail =
                booking.getWorker()
                        .getUser()
                        .getEmail();

        if (!assignedWorkerEmail.equalsIgnoreCase(email)) {
            throw new AccessDeniedException(
                    "You can manage only bookings assigned to you"
            );
        }
    }

    // Only the customer who owns this booking or ADMIN
    private void authorizeCustomerOrAdmin(Booking booking) {

        if (isAdmin()) {
            return;
        }

        requireRole(Role.CUSTOMER);

        String email = getCurrentUserEmail();

        String customerEmail =
                booking.getCustomer().getEmail();

        if (!customerEmail.equalsIgnoreCase(email)) {
            throw new AccessDeniedException(
                    "You can cancel only your own bookings"
            );
        }
    }

    // Validate the booking's current status
    private void validateStatus(
            Booking booking,
            BookingStatus expectedStatus,
            String errorMessage) {

        if (booking.getStatus() != expectedStatus) {
            throw new IllegalStateException(errorMessage);
        }
    }

    private Booking getBookingEntity(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));
    }

    // Convert the entity into a response DTO
    private BookingResponse convertToResponse(Booking booking) {

        BookingResponse response = new BookingResponse();

        response.setId(booking.getId());

        response.setCustomerId(
                booking.getCustomer().getId()
        );

        response.setWorkerId(
                booking.getWorker().getId()
        );

        response.setServiceId(
                booking.getService().getId()
        );

        response.setServiceName(
                booking.getService().getName()
        );

        response.setCustomerName(booking.getCustomer().getName());
        response.setCustomerEmail(booking.getCustomer().getEmail());
        response.setCustomerPhone(booking.getCustomer().getPhone());

        response.setWorkerName(booking.getWorker().getUser().getName());
        response.setWorkerEmail(booking.getWorker().getUser().getEmail());
        response.setWorkerPhone(booking.getWorker().getUser().getPhone());
        response.setWorkerLocation(booking.getWorker().getLocation());
        response.setWorkerExperience(booking.getWorker().getExperience());

        response.setScheduledAt(
                booking.getScheduledAt()
        );

        response.setAddress(
                booking.getAddress()
        );

        response.setProblemDescription(
                booking.getProblemDescription()
        );

        response.setStatus(
                booking.getStatus()
        );

        return response;
    }

    // Get bookings assigned to the currently logged-in worker
    public List<BookingResponse> getMyWorkerBookings() {

        requireRole(Role.WORKER);

        String email = getCurrentUserEmail();

        Worker worker = workerRepository.findByUser_Email(email)
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        return bookingRepository.findByWorker_Id(worker.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Get bookings belonging to the currently logged-in customer
    public List<BookingResponse> getMyCustomerBookings() {

        requireRole(Role.CUSTOMER);

        String email = getCurrentUserEmail();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer profile not found"));

        return bookingRepository.findByCustomer_Id(customer.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
}
