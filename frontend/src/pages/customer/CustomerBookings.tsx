
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
  SlidersHorizontal,
  ClipboardList,
  Filter,
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
  const {
    bookings,
    bookingsError,
    bookingsLoading,
    loadBookings,
    bookingSearch,
    setBookingSearch,
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingGroup,
    setBookingGroup,
    bookingSortOrder,
    setBookingSortOrder,
    filteredBookings,
    visibleBookings,
    statusStyles,
    formatStatus,
    cancellingBookingId,
    setBookingToCancel,
    setCancellationReason,
    setCancellationError,
    myReviews,
    setReviewBooking,
    setReviewRating,
    setReviewComment,
    setReviewsError,
    openBookingDetails,
    formatBookingDate,
    showAllBookings,
    setShowAllBookings,
    navigate,
  } = props;

  const groups = [
    { value: "ALL", label: "All bookings" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAST", label: "Past" },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <ClipboardList size={14} />
              Booking management
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Bookings
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
              Keep track of your service requests, check booking progress, and
              manage your appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBookings()}
            disabled={bookingsLoading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={bookingsLoading ? "animate-spin" : ""}
            />
            Refresh bookings
          </button>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-sm text-emerald-100/80">
          <span className="flex items-center gap-2">
            <ClipboardList size={16} />
            {bookings.length} total bookings
          </span>
          <span className="flex items-center gap-2">
            <Filter size={16} />
            {filteredBookings.length} matching results
          </span>
        </div>
      </section>

      {/* Booking filters */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Your service requests
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Search and filter your bookings.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {filteredBookings.length} results
          </span>
        </div>

        {/* Booking groups */}
        <div className="mt-6 flex flex-wrap gap-2">
          {groups.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setBookingGroup(option.value);
                setShowAllBookings(false);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                bookingGroup === option.value
                  ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Search and dropdown filters */}
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_210px_180px]">
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={bookingSearch}
              onChange={(event) => {
                setBookingSearch(event.target.value);
                setShowAllBookings(false);
              }}
              placeholder="Search worker, service or booking ID"
              aria-label="Search bookings"
              className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={bookingStatusFilter}
            onChange={(event) => {
              setBookingStatusFilter(event.target.value);
              setShowAllBookings(false);
            }}
            aria-label="Filter bookings by status"
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
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
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="NEWEST">Newest first</option>
            <option value="OLDEST">Oldest first</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-800">{bookings.length}</span>{" "}
            bookings
          </p>
          <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <SlidersHorizontal size={14} />
            Filters
          </span>
        </div>
      </section>

      {/* Error state */}
      {bookingsError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          <p className="font-semibold">{bookingsError}</p>
          <button
            type="button"
            onClick={() => void loadBookings()}
            className="mt-3 font-bold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {bookingsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 max-w-full rounded bg-slate-100" />
                </div>
                <div className="h-8 w-24 rounded-full bg-slate-100" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CalendarDays size={30} />
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-slate-900">
            {bookings.length === 0
              ? "No bookings yet"
              : "No matching bookings"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {bookings.length === 0
              ? "Your service requests will appear here once you book a worker. Find a professional and get started."
              : "We couldn't find any bookings matching your current search or filters. Try changing them."}
          </p>

          {bookings.length === 0 && (
            <button
              type="button"
              onClick={() => navigate("/customer/dashboard/find-workers")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Find a worker
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        /* Booking cards */
        <div className="space-y-4">
          {visibleBookings.map((booking) => (
            <article
              key={booking.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="p-5 sm:p-6">
                {/* Booking title and actions */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                        {booking.serviceName ||
                          `Service #${booking.serviceId}`}
                      </h3>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          statusStyles[booking.status] ||
                          statusStyles.PENDING
                        }`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Booking{" "}
                      <span className="font-bold text-slate-700">
                        #{booking.id}
                      </span>
                      <span className="mx-2 text-slate-300">•</span>
                      Worker{" "}
                      <span className="font-bold text-slate-700">
                        #{booking.workerId}
                      </span>
                    </p>
                  </div>

                  {(booking.status === "PENDING" ||
                    booking.status === "ACCEPTED") && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingToCancel(booking);
                        setCancellationReason("");
                        setCancellationError("");
                      }}
                      disabled={cancellingBookingId === booking.id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Ban size={16} />
                      {cancellingBookingId === booking.id
                        ? "Cancelling..."
                        : "Cancel booking"}
                    </button>
                  )}
                </div>

                {/* Booking information */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                      <Clock size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Scheduled date
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {formatBookingDate(booking.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                      <MapPin size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Service address
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {booking.address}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.problemDescription && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Problem description
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {booking.problemDescription}
                    </p>
                  </div>
                )}

                {/* Booking actions */}
                <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  {booking.status === "COMPLETED" &&
                    (myReviews.some(
                      (review) => review.bookingId === booking.id,
                    ) ? (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                        <CheckCircle2 size={16} />
                        Reviewed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewBooking(booking);
                          setReviewRating(5);
                          setReviewComment("");
                          setReviewsError("");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        <Star size={16} />
                        Write review
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() => void openBookingDetails(booking.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    View details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* Show all bookings */}
          {filteredBookings.length > 3 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setShowAllBookings((current: boolean) => !current)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                {showAllBookings
                  ? "Show less"
                  : `View all ${filteredBookings.length} bookings`}
                <ArrowRight
                  size={16}
                  className={`transition-transform ${
                    showAllBookings ? "-rotate-90" : "rotate-90"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
