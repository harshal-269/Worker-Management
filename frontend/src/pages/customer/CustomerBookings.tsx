import {
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  RefreshCw,
  Search,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { Booking, BookingStatus, Review } from "../CustomerDashboard";

type Props = {
  bookings: Booking[];
  bookingsError: string;
  bookingsLoading: boolean;
  loadBookings: () => Promise<void>;
  bookingSearch: string;
  setBookingSearch: Dispatch<SetStateAction<string>>;
  bookingStatusFilter: string;
  setBookingStatusFilter: Dispatch<SetStateAction<string>>;
  bookingGroup: string;
  setBookingGroup: Dispatch<SetStateAction<string>>;
  bookingSortOrder: string;
  setBookingSortOrder: Dispatch<SetStateAction<string>>;
  filteredBookings: Booking[];
  visibleBookings: Booking[];
  statusStyles: Record<BookingStatus, string>;
  formatStatus: (status?: string | null) => string;
  cancellingBookingId: number | null;
  setBookingToCancel: Dispatch<SetStateAction<Booking | null>>;
  setCancellationReason: Dispatch<SetStateAction<string>>;
  setCancellationError: Dispatch<SetStateAction<string>>;
  myReviews: Review[];
  setReviewBooking: Dispatch<SetStateAction<Booking | null>>;
  setReviewRating: Dispatch<SetStateAction<number>>;
  setReviewComment: Dispatch<SetStateAction<string>>;
  setReviewsError: Dispatch<SetStateAction<string>>;
  openBookingDetails: (bookingId: number) => Promise<void>;
  formatBookingDate: (date: string) => string;
  showAllBookings: boolean;
  setShowAllBookings: Dispatch<SetStateAction<boolean>>;
  navigate: NavigateFunction;
};

export default function CustomerBookings(props: Props) {
  const { bookings, bookingsError, bookingsLoading, loadBookings, bookingSearch, setBookingSearch, bookingStatusFilter, setBookingStatusFilter, bookingGroup, setBookingGroup, bookingSortOrder, setBookingSortOrder, filteredBookings, visibleBookings, statusStyles, formatStatus, cancellingBookingId, setBookingToCancel, setCancellationReason, setCancellationError, myReviews, setReviewBooking, setReviewRating, setReviewComment, setReviewsError, openBookingDetails, formatBookingDate, showAllBookings, setShowAllBookings, navigate } = props;

  return (
<div className="space-y-8">
          <section id="my-bookings" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <h2 className="text-xl font-extrabold sm:text-2xl">My Bookings</h2>
    <p className="mt-2 text-sm text-slate-500">Track your service requests and manage eligible bookings.</p>
  </div>
  <button
    type="button"
    onClick={() => void loadBookings()}
    disabled={bookingsLoading}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
  >
    <RefreshCw size={16} className={bookingsLoading ? "animate-spin" : ""} /> Refresh
  </button>
</div>

<div className="mt-6 space-y-4">
  <div className="flex flex-wrap gap-2">
    {[
      { value: "ALL", label: "All bookings" },
      { value: "ACTIVE", label: "Active" },
      { value: "PAST", label: "Past" },
    ].map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => {
          setBookingGroup(option.value);
          setShowAllBookings(false);
        }}
        className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
          bookingGroup === option.value
            ? "bg-emerald-600 text-white"
            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>

  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
      <Search size={18} className="shrink-0 text-slate-400" />
      <input
        value={bookingSearch}
        onChange={(event) => {
          setBookingSearch(event.target.value);
          setShowAllBookings(false);
        }}
        placeholder="Search worker, service or booking ID"
        aria-label="Search bookings"
        className="w-full py-3 text-sm outline-none"
      />
    </div>
    <select
      value={bookingStatusFilter}
      onChange={(event) => {
        setBookingStatusFilter(event.target.value);
        setShowAllBookings(false);
      }}
      aria-label="Filter bookings by status"
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
    >
      <option value="ALL">All statuses</option>
      <option value="PENDING">Pending</option>
      <option value="ACCEPTED">Accepted</option>
      <option value="IN_PROGRESS">In progress</option>
      <option value="COMPLETED">Completed</option>
      <option value="REJECTED">Rejected</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
    <select
      value={bookingSortOrder}
      onChange={(event) => {
        setBookingSortOrder(event.target.value);
        setShowAllBookings(false);
      }}
      aria-label="Sort bookings by date"
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
    >
      <option value="NEWEST">Newest first</option>
      <option value="OLDEST">Oldest first</option>
    </select>
  </div>
  <p className="text-xs text-slate-500">
    Showing {filteredBookings.length} of {bookings.length} bookings
  </p>
</div>

{bookingsError && (
  <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    <p>{bookingsError}</p>
    <button type="button" onClick={() => void loadBookings()} className="mt-2 font-bold underline">Try again</button>
  </div>
)}

{bookingsLoading ? (
  <div className="py-12 text-center text-sm text-slate-500">Loading your bookings...</div>
) : filteredBookings.length === 0 ? (
  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
    <CalendarDays size={34} className="mx-auto text-slate-400" />
    <h3 className="mt-3 font-bold text-slate-800">
      {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
    </h3>
    <p className="mt-2 text-sm text-slate-500">
      {bookings.length === 0
        ? "Your service requests will appear here after you book a worker."
        : "Try changing your search or filters to see more bookings."}
    </p>
    {bookings.length === 0 && (
      <button type="button" onClick={() => navigate("/customer/dashboard/find-workers")} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Find a worker</button>
    )}
  </div>
) : (
  <div className="mt-6 space-y-4">
    {visibleBookings.map((booking) => (
      <article key={booking.id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">{booking.serviceName || `Service #${booking.serviceId}`}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status] || statusStyles.PENDING}`}>{formatStatus(booking.status)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Booking #{booking.id} · Worker #{booking.workerId}</p>
          </div>
          {(booking.status === "PENDING" || booking.status === "ACCEPTED") && (
            <button
              type="button"
              onClick={() => {
                setBookingToCancel(booking);
                setCancellationReason("");
                setCancellationError("");
              }}
              disabled={cancellingBookingId === booking.id}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban size={16} /> {cancellingBookingId === booking.id ? "Cancelling..." : "Cancel booking"}
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {booking.status === "COMPLETED" && (
            myReviews.some((review) => review.bookingId === booking.id) ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={16} /> Reviewed</span>
            ) : (
              <button type="button" onClick={() => { setReviewBooking(booking); setReviewRating(5); setReviewComment(""); setReviewsError(""); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100"><Star size={16} /> Write review</button>
            )
          )}
          <button type="button" onClick={() => void openBookingDetails(booking.id)} className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
            View details
          </button>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scheduled date</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700"><Clock size={16} className="text-slate-400" />{formatBookingDate(booking.scheduledAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Service address</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700"><MapPin size={16} className="shrink-0 text-slate-400" />{booking.address}</p>
          </div>
        </div>
        {booking.problemDescription && <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-700">Problem: </span>{booking.problemDescription}</p>}
      </article>
    ))}
    {filteredBookings.length > 3 && (
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setShowAllBookings((current: boolean) => !current)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
        >
          {showAllBookings ? "Show less" : `View all ${filteredBookings.length} bookings`}
          <ArrowRight size={16} className={showAllBookings ? "-rotate-90" : "rotate-90"} />
        </button>
      </div>
    )}
  </div>
)}
          </section>

</div>
  );
}
