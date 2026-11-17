
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
  IndianRupee,
  FileText,
  Wallet,
  ChevronUp,
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
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

const statusLabels: Record<BillingStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
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

  const [showChargeForm, setShowChargeForm] = useState(false);

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

  const selectedBooking = bookings.find(
    (booking) => booking.id === selectedBookingId,
  );

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
      setShowChargeForm(false);

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
    setShowChargeForm(false);
  };

  const closeBill = () => {
    if (saving || loading) return;

    setSelectedBookingId(null);
    setBill(null);
    setError("");
    setSuccess("");
    resetForm();
  };

  const handleAddCharge = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
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
    setShowChargeForm(true);

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

  const submitBill = async () => {
    if (!selectedBookingId || !isEditable || saving) return;

    if (selectedBooking?.status !== "COMPLETED") {
      setError(
        "You can submit the final bill only after completing the job.",
      );
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

      setSuccess(
        "Bill submitted to the customer successfully.",
      );
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
    <section className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Receipt size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Billing Management
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Manage job charges and customer bills
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <FileText size={16} className="text-emerald-700" />
          <span className="text-sm font-semibold text-emerald-800">
            {acceptedBookings.length} billable bookings
          </span>
        </div>
      </div>

      {/* Booking list */}
      {acceptedBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Receipt size={30} className="text-slate-300" />
          </div>

          <h3 className="mt-4 font-bold text-slate-800">
            No billable bookings yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Accepted, in-progress and completed bookings will
            appear here when they are ready for billing.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {acceptedBookings.map((booking) => {
            const isSelected = selectedBookingId === booking.id;

            return (
              <div
                key={booking.id}
                className={`rounded-2xl border bg-white p-5 transition ${
                  isSelected
                    ? "border-emerald-300 shadow-md shadow-emerald-900/5"
                    : "border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                      <Receipt size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {booking.serviceName}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.customerName ||
                          `Customer #${booking.customerId}`}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Booking #{booking.id}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-slate-300" />

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            booking.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700"
                              : booking.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {booking.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        closeBill();
                      } else {
                        void loadBill(booking.id);
                      }
                    }}
                    disabled={loading || saving}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <ChevronUp size={17} />
                        Close bill
                      </>
                    ) : (
                      <>
                        <Receipt size={17} />
                        Manage bill
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-12 text-sm font-medium text-slate-500">
          <RefreshCw size={19} className="animate-spin text-emerald-600" />
          Loading billing information...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected bill */}
      {bill && selectedBooking && !loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Bill heading */}
          <div className="border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <Receipt size={15} />
                  Booking #{bill.bookingId}
                </div>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedBooking.serviceName} Bill
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedBooking.customerName ||
                    `Customer #${selectedBooking.customerId}`}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-bold ${statusStyles[bill.billingStatus]}`}
              >
                {bill.billingStatus === "APPROVED" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Clock size={15} />
                )}
                {statusLabels[bill.billingStatus]}
              </span>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Rejection notice */}
            {bill.billingStatus === "REJECTED" &&
              bill.rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <AlertCircle size={18} />
                    Customer's rejection reason
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                    {bill.rejectionReason}
                  </p>

                  <p className="mt-2 text-xs font-medium text-red-600">
                    Revise the charges and submit the bill again.
                  </p>
                </div>
              )}

            {/* Bill summary */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-700" />
                <h4 className="font-bold text-slate-900">
                  Bill summary
                </h4>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      Visiting charge
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currency(bill.visitingCharge)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      Additional charges
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currency(bill.additionalChargesTotal)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          Total bill
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Final amount payable
                        </p>
                      </div>

                      <p className="text-2xl font-extrabold tracking-tight text-emerald-700">
                        {currency(bill.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional charges */}
            <div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Additional charge items
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Itemized expenses for this booking
                  </p>
                </div>

                <span className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {bill.charges.length} items
                </span>
              </div>

              {bill.charges.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <FileText
                    size={25}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    No additional charges
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Added expenses will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {bill.charges.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {charge.name}
                        </p>

                        {charge.description && (
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-500">
                            {charge.description}
                          </p>
                        )}

                        <p className="mt-2 text-sm font-bold text-emerald-700">
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
                            className="rounded-lg border border-slate-200 p-2.5 text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteCharge(charge.id)
                            }
                            disabled={saving}
                            title="Delete charge"
                            className="rounded-lg border border-slate-200 p-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
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

            {/* Add charge section */}
            {isEditable && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {editingChargeId
                        ? "Edit charge"
                        : "Additional expenses"}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Add any extra materials, parts or service costs.
                    </p>
                  </div>

                  {!showChargeForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowChargeForm(true);
                        setError("");
                        setSuccess("");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      <Plus size={17} />
                      Add charge
                    </button>
                  )}
                </div>

                {showChargeForm && (
                  <form
                    onSubmit={handleAddCharge}
                    className="mt-5 space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="worker-charge-name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="worker-charge-description"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="worker-charge-amount"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Amount (₹)
                      </label>

                      <div className="relative">
                        <IndianRupee
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
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
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : editingChargeId ? (
                          <Pencil size={16} />
                        ) : (
                          <Plus size={16} />
                        )}

                        {saving
                          ? "Saving..."
                          : editingChargeId
                            ? "Update charge"
                            : "Save charge"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Billing status notices */}
            {bill.billingStatus === "PENDING_APPROVAL" && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Clock
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-700"
                />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Waiting for customer approval
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Your bill has been submitted successfully. The
                    customer needs to review and approve it.
                  </p>
                </div>
              </div>
            )}

            {bill.billingStatus === "APPROVED" && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Bill approved!
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    The customer has approved this final bill.
                  </p>
                </div>
              </div>
            )}

            {/* Submit bill */}
            {isEditable && (
              <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Ready to submit?
                  </p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Review all charges carefully. You can submit
                    the final bill once the job is completed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void submitBill()}
                  disabled={
                    saving ||
                    bill.visitingCharge == null ||
                    selectedBooking.status !== "COMPLETED"
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={17} />
                  {saving ? "Submitting..." : "Submit final bill"}
                </button>
              </div>
            )}

            {/* Success message */}
            {success && (
              <p
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
              >
                {success}
              </p>
            )}

            {/* Close */}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeBill}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={16} />
                Close bill
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkerBillingPanel;
