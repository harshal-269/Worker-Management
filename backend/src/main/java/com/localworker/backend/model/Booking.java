
package com.localworker.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime scheduledAt;

    private String address;

    private String problemDescription;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    // Existing cancellation and rejection details
    @Column(length = 1000)
    private String cancellationReason;

    @Column(length = 1000)
    private String rejectionReason;

    private LocalDateTime cancelledAt;

    private LocalDateTime rejectedAt;

    // Visiting charge snapshot captured when booking is created
    @Column(name = "visiting_charge", precision = 10, scale = 2)
    private BigDecimal visitingCharge;

    // Billing workflow status
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", length = 30)
    private BillingStatus billingStatus = BillingStatus.DRAFT;

    // Customer's bill rejection details
    @Column(length = 1000)
    private String billRejectionReason;

    private LocalDateTime billSubmittedAt;

    private LocalDateTime billApprovedAt;

    // Itemized additional charges
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("id ASC")
    private List<BookingCharge> charges = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    public Booking() {
    }

    public Booking(
            Long id,
            LocalDateTime scheduledAt,
            String address,
            String problemDescription,
            BookingStatus status,
            User customer,
            Worker worker,
            Service service
    ) {
        this.id = id;
        this.scheduledAt = scheduledAt;
        this.address = address;
        this.problemDescription = problemDescription;
        this.status = status;
        this.customer = customer;
        this.worker = worker;
        this.service = service;
    }

    public void addCharge(BookingCharge charge) {
        charges.add(charge);
        charge.setBooking(this);
    }

    public void removeCharge(BookingCharge charge) {
        charges.remove(charge);
        charge.setBooking(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public BigDecimal getVisitingCharge() {
        return visitingCharge;
    }

    public void setVisitingCharge(BigDecimal visitingCharge) {
        this.visitingCharge = visitingCharge;
    }

    public BillingStatus getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(BillingStatus billingStatus) {
        this.billingStatus = billingStatus;
    }

    public String getBillRejectionReason() {
        return billRejectionReason;
    }

    public void setBillRejectionReason(String billRejectionReason) {
        this.billRejectionReason = billRejectionReason;
    }

    public LocalDateTime getBillSubmittedAt() {
        return billSubmittedAt;
    }

    public void setBillSubmittedAt(LocalDateTime billSubmittedAt) {
        this.billSubmittedAt = billSubmittedAt;
    }

    public LocalDateTime getBillApprovedAt() {
        return billApprovedAt;
    }

    public void setBillApprovedAt(LocalDateTime billApprovedAt) {
        this.billApprovedAt = billApprovedAt;
    }

    public List<BookingCharge> getCharges() {
        return charges;
    }

    public void setCharges(List<BookingCharge> charges) {
        this.charges = charges;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }
}
