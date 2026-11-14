
import { useState, type FormEvent } from "react";
import api from "../api/axios";
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  Send,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

interface WorkerBooking {
  id: number;
  serviceName: string;
  customerName?: string | null;
  customerId: number;
  status: BookingStatus;
}

type BillingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

interface BookingCharge {
  id: number;
  name: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface BookingBill {
  bookingId: number;
  visitingCharge: number;
  charges: BookingCharge[];
  additionalChargesTotal: number;
  totalAmount: number;
  billingStatus: BillingStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface ChargeForm {
  name: string;
  description: string;
  amount: string;
}

interface WorkerBillingPanelProps {
  bookings: WorkerBooking[];
}

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const statusStyles: Record<BillingStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

function WorkerBillingPanel({ bookings }: WorkerBillingPanelProps) {
  const [selectedBookingId, setSelectedBookingId] =
    useState<number | null>(null);

  const [bill, setBill] = useState<BookingBill | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<ChargeForm>({
    name: "",
    description: "",
    amount: "",
  });

  const [editingChargeId, setEditingChargeId] =
    useState<number | null>(null);

  const acceptedBookings = bookings.filter(
    (booking) =>
      booking.status === "ACCEPTED" ||
      booking.status === "IN_PROGRESS" ||
      booking.status === "COMPLETED",
  );

  const isEditable =
    bill !== null &&
    selectedBookingId !== null &&
    bookings.some(
      (booking) =>
        booking.id === selectedBookingId &&
        (booking.status === "IN_PROGRESS" ||
          booking.status === "COMPLETED"),
    ) &&
    (bill.billingStatus === "DRAFT" ||
      bill.billingStatus === "REJECTED");

  const loadBill = async (bookingId: number) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get<BookingBill>(
        `/bookings/${bookingId}/bill`,
      );

      setBill(response.data);
      setSelectedBookingId(bookingId);
      setEditingChargeId(null);

      setForm({
        name: "",
        description: "",
        amount: "",
      });
    } catch (err: any) {
      console.error("Unable to load bill:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this bill. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      amount: "",
    });

    setEditingChargeId(null);
  };

  const closeBill = () => {
    if (saving || loading) return;

    setSelectedBookingId(null);
    setBill(null);
    setError("");
    setSuccess("");
    resetForm();
  };

  const handleAddCharge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedBookingId || !isEditable || saving) return;

    const name = form.name.trim();
    const description = form.description.trim();
    const amount = Number(form.amount);

    if (!name) {
      setError("Please enter a charge name.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0.01) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (amount > 99999999.99) {
      setError("The amount is too large.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name,
        description,
        amount,
      };

      const response = editingChargeId
        ? await api.put<BookingBill>(
            `/bookings/${selectedBookingId}/charges/${editingChargeId}`,
            payload,
          )
        : await api.post<BookingBill>(
            `/bookings/${selectedBookingId}/charges`,
            payload,
          );

      setBill(response.data);

      setSuccess(
        editingChargeId
          ? "Charge updated successfully."
          : "Charge added successfully.",
      );

      resetForm();
    } catch (err: any) {
      console.error("Unable to save charge:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save this charge. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (charge: BookingCharge) => {
    if (!isEditable) return;

    setEditingChargeId(charge.id);

    setForm({
      name: charge.name,
      description: charge.description ?? "",
      amount: String(charge.amount),
    });

    setError("");
    setSuccess("");
  };

  const deleteCharge = async (chargeId: number) => {
    if (!selectedBookingId || !isEditable || saving) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this charge?",
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.delete<BookingBill>(
        `/bookings/${selectedBookingId}/charges/${chargeId}`,
      );

      setBill(response.data);

      if (editingChargeId === chargeId) {
        resetForm();
      }

      setSuccess("Charge deleted successfully.");
    } catch (err: any) {
      console.error("Unable to delete charge:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this charge.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedBooking = bookings.find(
    (booking) => booking.id === selectedBookingId,
  );

  const submitBill = async () => {
    if (!selectedBookingId || !isEditable || saving) return;

    if (selectedBooking?.status !== "COMPLETED") {
      setError("You can submit the final bill only after completing the job.");
      return;
    }

    if (!bill || bill.visitingCharge == null) {
      setError("Visiting charge is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Submit this bill to the customer for approval?",
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post<BookingBill>(
        `/bookings/${selectedBookingId}/bill/submit`,
      );

      setBill(response.data);

      resetForm();

      setSuccess("Bill submitted to the customer successfully.");
    } catch (err: any) {
      console.error("Unable to submit bill:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit the bill. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="text-emerald-600" size={22} />

            <h2 className="text-xl font-bold text-gray-900">
              Billing Management
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Prepare charges during the job and submit the final bill after completion.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {acceptedBookings.length} active bookings
        </span>
      </div>

      {acceptedBookings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <Receipt className="mx-auto text-gray-300" size={36} />

          <p className="mt-3 font-semibold text-gray-700">
            No active bookings
          </p>

          <p className="mt-1 text-sm text-gray-500">
            In-progress and completed bookings will appear here for billing management.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {acceptedBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.serviceName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {booking.customerName ||
                    `Customer #${booking.customerId}`}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Booking #{booking.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedBookingId === booking.id) {
                    closeBill();
                  } else {
                    void loadBill(booking.id);
                  }
                }}
                disabled={loading || saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Receipt size={16} />

                {selectedBookingId === booking.id
                  ? "Close bill"
                  : "Manage bill"}
              </button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-5 flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <RefreshCw size={17} className="animate-spin" />
          Loading bill...
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {bill && selectedBooking && !loading && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-slate-50 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Booking #{bill.bookingId}
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-900">
                {selectedBooking.serviceName} Bill
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {selectedBooking.customerName ||
                  `Customer #${selectedBooking.customerId}`}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[bill.billingStatus]}`}
            >
              {bill.billingStatus === "APPROVED" ? (
                <CheckCircle2 size={14} />
              ) : (
                <Clock size={14} />
              )}

              {bill.billingStatus.replaceAll("_", " ")}
            </span>
          </div>

          {bill.billingStatus === "REJECTED" &&
            bill.rejectionReason && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-800">
                  Customer's rejection reason
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                  {bill.rejectionReason}
                </p>

                <p className="mt-2 text-xs text-red-600">
                  Revise the charges and submit the bill again.
                </p>
              </div>
            )}

          <div className="mt-5 rounded-xl bg-white p-4">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Visiting charge</span>

              <span className="font-semibold text-gray-900">
                {currency(bill.visitingCharge)}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-3 text-sm">
              <span className="text-gray-600">
                Additional charges
              </span>

              <span className="font-semibold text-gray-900">
                {currency(bill.additionalChargesTotal)}
              </span>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex justify-between gap-3">
                <span className="font-bold text-gray-900">
                  Total bill
                </span>

                <span className="text-xl font-extrabold text-emerald-700">
                  {currency(bill.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-bold text-gray-900">
                Additional charge items
              </h4>

              <span className="text-xs text-gray-500">
                {bill.charges.length} items
              </span>
            </div>

            {bill.charges.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
                No additional charges added yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {bill.charges.map((charge) => (
                  <div
                    key={charge.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {charge.name}
                      </p>

                      {charge.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">
                          {charge.description}
                        </p>
                      )}

                      <p className="mt-2 font-bold text-gray-900">
                        {currency(charge.amount)}
                      </p>
                    </div>

                    {isEditable && (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(charge)}
                          disabled={saving}
                          title="Edit charge"
                          className="rounded-lg border border-gray-200 p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteCharge(charge.id)}
                          disabled={saving}
                          title="Delete charge"
                          className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditable && (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-white p-5">
              <div className="flex items-center gap-2">
                {editingChargeId ? (
                  <Pencil size={18} className="text-emerald-700" />
                ) : (
                  <Plus size={18} className="text-emerald-700" />
                )}

                <h4 className="font-bold text-gray-900">
                  {editingChargeId
                    ? "Edit charge"
                    : "Add additional charge"}
                </h4>
              </div>

              <form
                onSubmit={handleAddCharge}
                className="mt-4 space-y-4"
              >
                <div>
                  <label
                    htmlFor="worker-charge-name"
                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                  >
                    Charge name
                  </label>

                  <input
                    id="worker-charge-name"
                    type="text"
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Switch Replacement"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="worker-charge-description"
                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="worker-charge-description"
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Explain what this charge is for"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="worker-charge-amount"
                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                  >
                    Amount (₹)
                  </label>

                  <input
                    id="worker-charge-amount"
                    type="number"
                    required
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {editingChargeId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel edit
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    {saving
                      ? "Saving..."
                      : editingChargeId
                        ? "Update charge"
                        : "Add charge"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {bill.billingStatus === "PENDING_APPROVAL" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your bill has been submitted. Waiting for customer approval.
            </div>
          )}

          {bill.billingStatus === "APPROVED" && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              The customer has approved this final bill.
            </div>
          )}

          {isEditable && (
            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center">
              <p className="text-xs leading-5 text-gray-500">
                Review all charges carefully. You can submit the final bill once the job is completed.
              </p>

              <button
                type="button"
                onClick={() => void submitBill()}
                disabled={
                  saving ||
                  bill.visitingCharge == null ||
                  selectedBooking?.status !== "COMPLETED"
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {saving ? "Submitting..." : "Submit bill"}
              </button>
            </div>
          )}

          {success && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {success}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={closeBill}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkerBillingPanel;
