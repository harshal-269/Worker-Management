package com.localworker.backend.service;

import com.localworker.backend.dto.ReviewRequestDTO;
import com.localworker.backend.dto.ReviewResponseDTO;
import com.localworker.backend.model.Booking;
import com.localworker.backend.model.Review;
import com.localworker.backend.model.User;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.BookingRepository;
import com.localworker.backend.repository.ReviewRepository;
import com.localworker.backend.repository.UserRepository;
import com.localworker.backend.repository.WorkerRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            WorkerRepository workerRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
    }

    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO request) {

        String email = getAuthenticatedEmail();

        User customer = userRepository.findAllByEmail(email)
                .stream()
                .filter(user -> user.getRole() != null
                        && user.getRole().toString().equals("CUSTOMER"))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException("Customer account not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (booking.getCustomer() == null
                || !booking.getCustomer().getId().equals(customer.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only review your own bookings");
        }

        if (booking.getStatus() != com.localworker.backend.model.BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "You can review a booking only after it is completed");
        }

        if (reviewRepository.existsByBookingIdAndCustomerId(
                booking.getId(), customer.getId())) {
            throw new IllegalStateException(
                    "You have already reviewed this booking");
        }

        Worker worker = booking.getWorker();

        if (worker == null) {
            throw new IllegalStateException(
                    "No worker is assigned to this booking");
        }

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCustomer(customer);
        review.setWorker(worker);
        review.setBooking(booking);

        Review savedReview = reviewRepository.save(review);

        return convertToDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByWorker(Long workerId) {

        if (!workerRepository.existsById(workerId)) {
            throw new IllegalArgumentException("Worker not found");
        }

        return reviewRepository.findByWorkerId(workerId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long workerId) {

        if (!workerRepository.existsById(workerId)) {
            throw new IllegalArgumentException("Worker not found");
        }

        Double average = reviewRepository.calculateAverageRating(workerId);

        return average != null ? average : 0.0;
    }

    @Transactional(readOnly = true)
    public long getReviewCount(Long workerId) {

        if (!workerRepository.existsById(workerId)) {
            throw new IllegalArgumentException("Worker not found");
        }

        return reviewRepository.countByWorkerId(workerId);
    }

    private String getAuthenticatedEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You must be logged in");
        }

        return authentication.getName();
    }

    private ReviewResponseDTO convertToDTO(Review review) {

        String workerName = null;

        if (review.getWorker() != null
                && review.getWorker().getUser() != null) {
            workerName = review.getWorker().getUser().getName();
        }

        return new ReviewResponseDTO(
                review.getId(),
                review.getBooking().getId(),
                review.getCustomer().getId(),
                review.getWorker().getId(),
                workerName,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}