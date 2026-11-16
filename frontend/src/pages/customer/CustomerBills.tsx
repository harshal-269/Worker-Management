import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import api from "../../api/axios";

const formatStatus = (status?: string | null) =>
  (status ?? "UNKNOWN").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

type CustomerBillStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

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

import type { Booking } from "../CustomerDashboard";

export default function CustomerBills({ bookings }: { bookings: Booking[] }) {
  const [bills, setBills] = useState<Record<number, CustomerBookingBill>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionBookingId, setActionBookingId] = useState<number | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const eligibleBookings = useMemo(
    () => bookings.filter((booking) =>
      booking.status === "COMPLETED"
    ),
    [bookings],
  );

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(
        eligibleBookings.map(async (booking) => {
          try {
            const response = await api.get<CustomerBookingBill>(`/bookings/${booking.id}/bill`);
            return [booking.id, response.data] as const;
          } catch (requestError) {
            console.error(`Unable to load bill for booking ${booking.id}:`, requestError);
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
    .map((booking) => ({ booking, bill: bills[booking.id] }))
    .filter(({ bill }) => bill && bill.billingStatus !== "DRAFT");

  return (
    <section id="my-bills" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Billing & approval</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">My Bills</h2>
          <p className="mt-2 text-sm text-slate-500">
            Review the final itemized bill submitted by your service professional after the work is completed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadBills()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh bills
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {actionError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}

      {loading && visibleBills.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading bills...</p>
      ) : visibleBills.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <ClipboardList size={34} className="mx-auto text-slate-400" />
          <h3 className="mt-3 font-bold text-slate-800">No bills to review yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Once your service professional completes the job and submits the final bill, it will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {visibleBills.map(({ booking, bill }) => (
            <article key={booking.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900">{booking.serviceName}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Booking #{booking.id} · {booking.workerName || `Worker #${booking.workerId}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  bill.billingStatus === "PENDING_APPROVAL"
                    ? "bg-amber-50 text-amber-700"
                    : bill.billingStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : bill.billingStatus === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-600"
                }`}>
                  {formatStatus(bill.billingStatus)}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-600">Visiting charge</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(bill.visitingCharge ?? 0).toFixed(2)}
                  </span>
                </div>
                {bill.charges?.map((charge) => (
                  <div key={charge.id} className="flex justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{charge.name}</p>
                      {charge.description && <p className="mt-0.5 text-xs text-slate-500">{charge.description}</p>}
                    </div>
                    <span className="shrink-0 font-semibold text-slate-900">₹{Number(charge.amount).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-sm">
                  <span className="font-semibold text-slate-700">Additional charges</span>
                  <span className="font-semibold text-slate-900">₹{Number(bill.additionalChargesTotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 rounded-xl bg-emerald-50 p-4">
                  <span className="font-extrabold text-emerald-900">Total amount</span>
                  <span className="text-lg font-extrabold text-emerald-800">₹{Number(bill.totalAmount ?? 0).toFixed(2)}</span>
                </div>
              </div>

              {bill.billingStatus === "REJECTED" && bill.rejectionReason && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-800">Your previous rejection reason</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">{bill.rejectionReason}</p>
                  <p className="mt-2 text-xs text-red-600">The worker can revise and submit the bill again.</p>
                </div>
              )}

              {bill.billingStatus === "PENDING_APPROVAL" && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingBookingId(booking.id);
                      setRejectionReason("");
                      setActionError("");
                    }}
                    disabled={actionBookingId !== null}
                    className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject bill
                  </button>
                  <button
                    type="button"
                    onClick={() => void approveBill(booking.id)}
                    disabled={actionBookingId !== null}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actionBookingId === booking.id ? "Processing..." : "Approve bill"}
                  </button>
                </div>
              )}

              {bill.billingStatus === "APPROVED" && (
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={17} /> You approved this final bill. Payment can be handled separately.
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {rejectingBookingId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onClick={() => {
          if (actionBookingId === null) {
            setRejectingBookingId(null);
            setRejectionReason("");
          }
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-customer-bill-title"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="reject-customer-bill-title" className="text-xl font-extrabold text-slate-900">
              Reject bill for booking #{rejectingBookingId}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Explain what needs to be corrected. The worker can revise and submit the bill again.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value);
                setActionError("");
              }}
              maxLength={1000}
              rows={4}
              placeholder="Enter your reason..."
              className="mt-5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{rejectionReason.length}/1000</p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={actionBookingId !== null}
                onClick={() => {
                  setRejectingBookingId(null);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep bill
              </button>
              <button
                type="button"
                onClick={() => void rejectBill()}
                disabled={actionBookingId !== null || !rejectionReason.trim()}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionBookingId === rejectingBookingId ? "Submitting..." : "Confirm rejection"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
