
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  MapPin,
  Search,
  XCircle,
  CalendarDays,
  Clock3,
  ArrowRight,
} from "lucide-react";
import type { Booking } from "../WorkerDashboard";

type WorkerBookingsProps = {
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string;
  bookingActionLoading: number | null;
  onOpenBookingDetails: (bookingId: number) => void | Promise<void>;
  onUpdateBookingStatus: (bookingId: number, action: "accept" | "start" | "complete") => void | Promise<void>;
  onOpenRejectBookingModal: (booking: Booking) => void;
  formatBookingDate: (scheduledAt: string) => string;
  formatBookingTime: (scheduledAt: string) => string;
  getCustomerLabel: (booking: Booking) => string;
  getStatusStyle: (status: Booking["status"]) => string;
  getStatusLabel: (status: Booking["status"]) => string;
};

export default function WorkerBookings({
  bookings,
  bookingsLoading,
  bookingsError,
  bookingActionLoading,
  onOpenBookingDetails,
  onUpdateBookingStatus,
  onOpenRejectBookingModal,
  formatBookingDate,
  formatBookingTime,
  getCustomerLabel,
  getStatusStyle,
  getStatusLabel,
}: WorkerBookingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) =>
      [
        getCustomerLabel(booking),
        booking.serviceName,
        booking.address,
        booking.status,
        String(booking.id),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [bookings, searchQuery, getCustomerLabel]);

  const visibleBookings =
    showAllBookings || searchQuery.trim()
      ? filteredBookings
      : filteredBookings.slice(0, 5);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const activeCount = bookings.filter(
    (b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS",
  ).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <section id="bookings" className="space-y-7 scroll-mt-28">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Booking management
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            My Bookings
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Review customer requests and manage your scheduled jobs.
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowAllBookings(false);
            }}
            placeholder="Search customer, service, location..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Pending requests",
            value: pendingCount,
            icon: Clock3,
            style: "bg-amber-50 text-amber-600",
          },
          {
            label: "Active bookings",
            value: activeCount,
            icon: CalendarDays,
            style: "bg-blue-50 text-blue-600",
          },
          {
            label: "Completed jobs",
            value: completedCount,
            icon: Check,
            style: "bg-emerald-50 text-emerald-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.style}`}>
                <Icon size={21} />
              </div>
            </div>
          );
        })}
      </div>

      {bookingsError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{bookingsError}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              All customer requests
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filteredBookings.length} booking
              {filteredBookings.length === 1 ? "" : "s"} found
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            Automatically refreshed
          </span>
        </div>

        {bookingsLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-xl border border-gray-100 p-5">
                <div className="h-4 w-36 rounded bg-gray-100" />
                <div className="mt-3 h-3 w-52 rounded bg-gray-100" />
                <div className="mt-5 h-8 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <ClipboardList size={27} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">
              {searchQuery ? "No matching bookings" : "No bookings yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {searchQuery
                ? "Try searching with another customer name, service, or location."
                : "Customer booking requests will appear here when someone books your services."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleBookings.map((booking) => (
              <article
                key={booking.id}
                className="p-5 transition hover:bg-gray-50/60 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-extrabold text-emerald-700">
                      C{booking.customerId}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {getCustomerLabel(booking)}
                        </h3>
                        <span className="text-xs text-gray-400">
                          Booking #{booking.id}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-emerald-700">
                        {booking.serviceName}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatBookingDate(booking.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {formatBookingTime(booking.scheduledAt)}
                        </span>
                        <span className="flex items-start gap-1.5 sm:max-w-xs">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span>{booking.address}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(booking.status)}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onOpenBookingDetails(booking.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                  {booking.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void onUpdateBookingStatus(booking.id, "accept")}
                        disabled={bookingActionLoading === booking.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check size={15} />
                        {bookingActionLoading === booking.id ? "Processing..." : "Accept booking"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenRejectBookingModal(booking)}
                        disabled={bookingActionLoading === booking.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </>
                  ) : booking.status === "ACCEPTED" ? (
                    <button
                      type="button"
                      onClick={() => void onUpdateBookingStatus(booking.id, "start")}
                      disabled={bookingActionLoading === booking.id}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {bookingActionLoading === booking.id ? "Updating..." : "Start job"}
                    </button>
                  ) : booking.status === "IN_PROGRESS" ? (
                    <button
                      type="button"
                      onClick={() => void onUpdateBookingStatus(booking.id, "complete")}
                      disabled={bookingActionLoading === booking.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {bookingActionLoading === booking.id ? "Updating..." : "Mark as completed"}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No further action required for this booking.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {!searchQuery.trim() && filteredBookings.length > 5 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllBookings((current) => !current)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            {showAllBookings ? "Show fewer bookings" : `View all ${filteredBookings.length} bookings`}
            <ChevronDown
              size={16}
              className={`transition ${showAllBookings ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
