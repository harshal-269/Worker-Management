
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Receipt,
  Clock,
  AlertCircle,
  ShieldCheck,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import api from "../../api/axios";
import type { Booking } from "../CustomerDashboard";

const formatStatus = (status?: string | null) =>
  (status ?? "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

type CustomerBillStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

type CustomerBillCharge = {
  id: number;
  name: string;
  description?: string | null;
  amount: number;
};

type CustomerBookingBill = {
  bookingId: number;
  visitingCharge: number | null;
  charges: CustomerBillCharge[];
  additionalChargesTotal: number;
  totalAmount: number;
  billingStatus: CustomerBillStatus | null;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
};

const currency = (amount: number | null | undefined) =>
  `₹${Number(amount ?? 0).toFixed(2)}`;

export default function CustomerBills({
  bookings,
}: {
  bookings: Booking[];
}) {
  const [bills, setBills] = useState<
    Record<number, CustomerBookingBill>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionBookingId, setActionBookingId] = useState<number | null>(
    null,
  );
  const [rejectingBookingId, setRejectingBookingId] = useState<
    number | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const eligibleBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "COMPLETED"),
    [bookings],
  );

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all(
        eligibleBookings.map(async (booking) => {
          try {
            const response = await api.get<CustomerBookingBill>(
              `/bookings/${booking.id}/bill`,
            );
            return [booking.id, response.data] as const;
          } catch (requestError) {
            console.error(
              `Unable to load bill for booking ${booking.id}:`,
              requestError,
            );
            return null;
          }
        }),
      );

      const nextBills: Record<number, CustomerBookingBill> = {};

      for (const result of results) {
        if (result) nextBills[result[0]] = result[1];
      }

      setBills(nextBills);
    } catch (requestError) {
      console.error("Unable to load customer bills:", requestError);
      setError("Unable to load bills. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [eligibleBookings]);

  useEffect(() => {
    void loadBills();
  }, [loadBills]);

  const approveBill = async (bookingId: number) => {
    if (actionBookingId !== null) return;

    setActionBookingId(bookingId);
    setActionError("");

    try {
      await api.put(`/bookings/${bookingId}/bill/approve`);
      await loadBills();
    } catch (requestError: any) {
      console.error("Unable to approve bill:", requestError);

      setActionError(
        requestError?.response?.data?.message ||
          "Unable to approve this bill. Please try again.",
      );
    } finally {
      setActionBookingId(null);
    }
  };

  const rejectBill = async () => {
    if (rejectingBookingId === null || actionBookingId !== null) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError("Please enter a reason before rejecting the bill.");
      return;
    }

    const bookingId = rejectingBookingId;

    setActionBookingId(bookingId);
    setActionError("");

    try {
      await api.put(`/bookings/${bookingId}/bill/reject`, { reason });

      setRejectingBookingId(null);
      setRejectionReason("");

      await loadBills();
    } catch (requestError: any) {
      console.error("Unable to reject bill:", requestError);

      setActionError(
        requestError?.response?.data?.message ||
          "Unable to reject this bill. Please try again.",
      );
    } finally {
      setActionBookingId(null);
    }
  };

  const visibleBills = eligibleBookings
    .map((booking) => ({
      booking,
      bill: bills[booking.id],
    }))
    .filter(({ bill }) => bill && bill.billingStatus !== "DRAFT");

  const getStatusStyle = (status: CustomerBillStatus | null) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const pendingCount = visibleBills.filter(
    ({ bill }) => bill?.billingStatus === "PENDING_APPROVAL",
  ).length;

  const approvedCount = visibleBills.filter(
    ({ bill }) => bill?.billingStatus === "APPROVED",
  ).length;

  const totalBilled = visibleBills.reduce(
    (total, { bill }) => total + Number(bill?.totalAmount ?? 0),
    0,
  );

  return (
    <div id="my-bills" className="scroll-mt-24 space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <Receipt size={14} />
              Billing & approvals
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Bills
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
              Review itemized bills from your service professionals and
              approve or request corrections before payment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBills()}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh bills
          </button>
        </div>

        <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-emerald-100/70">
              Total billed
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {currency(totalBilled)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-emerald-100/70">
              Awaiting approval
            </p>
            <p className="mt-1 text-xl font-extrabold">{pendingCount}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-emerald-100/70">
              Approved bills
            </p>
            <p className="mt-1 text-xl font-extrabold">{approvedCount}</p>
          </div>
        </div>
      </section>

      {/* Error messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Section heading */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Your invoices
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Bills submitted for your completed bookings.
          </p>
        </div>

        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          {visibleBills.length} bills
        </span>
      </div>

      {/* Loading */}
      {loading && visibleBills.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="h-5 w-44 rounded bg-slate-200" />
              <div className="mt-4 h-3 w-60 rounded bg-slate-100" />
              <div className="mt-7 space-y-3">
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-14 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleBills.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ClipboardList size={30} />
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-slate-900">
            No bills to review yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once your service professional completes a job and submits
            the final bill, it will appear here for your review.
          </p>
        </div>
      ) : (
        /* Bill cards */
        <div className="space-y-5">
          {visibleBills.map(({ booking, bill }) => (
            <article
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-emerald-200 hover:shadow-md"
            >
              {/* Bill heading */}
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FileText size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {booking.serviceName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Booking #{booking.id}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {booking.workerName ||
                        `Worker #${booking.workerId}`}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                    bill.billingStatus,
                  )}`}
                >
                  {bill.billingStatus === "APPROVED" ? (
                    <CheckCircle2 size={14} />
                  ) : bill.billingStatus === "REJECTED" ? (
                    <XCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}

                  {formatStatus(bill.billingStatus)}
                </span>
              </div>

              {/* Bill breakdown */}
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Receipt size={17} className="text-emerald-700" />
                  <h4 className="text-sm font-extrabold text-slate-800">
                    Bill breakdown
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Visiting charge
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currency(bill.visitingCharge)}
                    </span>
                  </div>

                  {bill.charges?.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {charge.name}
                        </p>

                        {charge.description && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {charge.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 font-semibold text-slate-900">
                        {currency(charge.amount)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between gap-4 border-t border-dashed border-slate-200 pt-4 text-sm">
                    <span className="font-semibold text-slate-600">
                      Additional charges
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currency(bill.additionalChargesTotal)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-4 sm:p-5">
                    <div>
                      <p className="text-sm font-extrabold text-emerald-950">
                        Total amount
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Final bill amount
                      </p>
                    </div>

                    <p className="text-xl font-extrabold text-emerald-800 sm:text-2xl">
                      {currency(bill.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Rejection information */}
                {bill.billingStatus === "REJECTED" &&
                  bill.rejectionReason && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          size={17}
                          className="text-red-600"
                        />
                        <p className="text-sm font-bold text-red-800">
                          Previous rejection reason
                        </p>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                        {bill.rejectionReason}
                      </p>

                      <p className="mt-3 text-xs text-red-600">
                        The worker can revise and submit the bill again.
                      </p>
                    </div>
                  )}

                {/* Approval actions */}
                {bill.billingStatus === "PENDING_APPROVAL" && (
                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingBookingId(booking.id);
                        setRejectionReason("");
                        setActionError("");
                      }}
                      disabled={actionBookingId !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject bill
                    </button>

                    <button
                      type="button"
                      onClick={() => void approveBill(booking.id)}
                      disabled={actionBookingId !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionBookingId === booking.id ? (
                        <>
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Approve bill
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Approved message */}
                {bill.billingStatus === "APPROVED" && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        Bill approved successfully
                      </p>
                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        You approved this final bill. Payment can be
                        handled separately.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reject bill modal */}
      {rejectingBookingId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (actionBookingId === null) {
              setRejectingBookingId(null);
              setRejectionReason("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-customer-bill-title"
            className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={25} />
            </div>

            <h2
              id="reject-customer-bill-title"
              className="mt-5 text-xl font-extrabold text-slate-900"
            >
              Reject bill
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Rejecting bill for booking #{rejectingBookingId}. Explain
              what needs to be corrected so the worker can revise and
              resubmit it.
            </p>

            <label
              htmlFor="customer-bill-rejection-reason"
              className="mt-6 block text-sm font-bold text-slate-700"
            >
              Reason for rejection
            </label>

            <textarea
              id="customer-bill-rejection-reason"
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value);
                setActionError("");
              }}
              maxLength={1000}
              rows={4}
              placeholder="Describe what needs to be corrected..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {rejectionReason.length}/1000
            </p>

            {actionError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={actionBookingId !== null}
                onClick={() => {
                  setRejectingBookingId(null);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep bill
              </button>

              <button
                type="button"
                onClick={() => void rejectBill()}
                disabled={
                  actionBookingId !== null || !rejectionReason.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionBookingId === rejectingBookingId ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm rejection
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
