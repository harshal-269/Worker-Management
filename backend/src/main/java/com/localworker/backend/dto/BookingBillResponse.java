package com.localworker.backend.dto;

import com.localworker.backend.model.BillingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingBillResponse {

    private Long bookingId;

    private BigDecimal visitingCharge;

    private List<BookingChargeResponse> charges;

    private BigDecimal additionalChargesTotal;

    private BigDecimal totalAmount;

    private BillingStatus billingStatus;

    private String rejectionReason;

    private LocalDateTime submittedAt;

    private LocalDateTime approvedAt;

    public BookingBillResponse() {
    }

    public BookingBillResponse(
            Long bookingId,
            BigDecimal visitingCharge,
            List<BookingChargeResponse> charges,
            BigDecimal additionalChargesTotal,
            BigDecimal totalAmount,
            BillingStatus billingStatus,
            String rejectionReason,
            LocalDateTime submittedAt,
            LocalDateTime approvedAt
    ) {
        this.bookingId = bookingId;
        this.visitingCharge = visitingCharge;
        this.charges = charges;
        this.additionalChargesTotal = additionalChargesTotal;
        this.totalAmount = totalAmount;
        this.billingStatus = billingStatus;
        this.rejectionReason = rejectionReason;
        this.submittedAt = submittedAt;
        this.approvedAt = approvedAt;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getVisitingCharge() {
        return visitingCharge;
    }

    public void setVisitingCharge(BigDecimal visitingCharge) {
        this.visitingCharge = visitingCharge;
    }

    public List<BookingChargeResponse> getCharges() {
        return charges;
    }

    public void setCharges(List<BookingChargeResponse> charges) {
        this.charges = charges;
    }

    public BigDecimal getAdditionalChargesTotal() {
        return additionalChargesTotal;
    }

    public void setAdditionalChargesTotal(BigDecimal additionalChargesTotal) {
        this.additionalChargesTotal = additionalChargesTotal;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BillingStatus getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(BillingStatus billingStatus) {
        this.billingStatus = billingStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}