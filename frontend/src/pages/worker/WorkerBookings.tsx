import { useState } from "react";
import {
  Check,
  ChevronDown,
  MapPin,
  Search,
  XCircle,
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

/** Booking-management UI. Booking mutations and API calls remain in WorkerDashboard. */
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

  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase();
    return (
      getCustomerLabel(booking).toLowerCase().includes(query) ||
      booking.serviceName.toLowerCase().includes(query) ||
      booking.address.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  const visibleBookings =
    showAllBookings || searchQuery.trim()
      ? filteredBookings
      : filteredBookings.slice(0, 5);

  return (
<section id="bookings" className="scroll-mt-28">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  BOOKING MANAGEMENT
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  My Bookings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review requests and manage your scheduled jobs.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search bookings..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      {[
                        "Customer",
                        "Service",
                        "Date & Time",
                        "Location",
                        "Amount",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {visibleBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                              {`C${booking.customerId}`}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {getCustomerLabel(booking)}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                #{booking.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-gray-700">
                          {booking.serviceName}
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-gray-800">
                            {formatBookingDate(booking.scheduledAt)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatBookingTime(booking.scheduledAt)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin size={15} />
                            {booking.address}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm font-bold text-gray-900">
                          —
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              booking.status,
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void onOpenBookingDetails(booking.id)}
                            className="whitespace-nowrap rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Details
                          </button>
                          {booking.status === "PENDING" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void onUpdateBookingStatus(booking.id, "accept")}
                                disabled={bookingActionLoading === booking.id}
                                title="Accept booking"
                                aria-label={`Accept booking ${booking.id}`}
                                className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => onOpenRejectBookingModal(booking)}
                                disabled={bookingActionLoading === booking.id}
                                title="Reject booking"
                                aria-label={`Reject booking ${booking.id}`}
                                className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : booking.status === "ACCEPTED" ? (
                            <button
                              onClick={() => void onUpdateBookingStatus(booking.id, "start")}
                              disabled={bookingActionLoading === booking.id}
                              className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              Start job
                            </button>
                          ) : booking.status === "IN_PROGRESS" ? (
                            <button
                              onClick={() => void onUpdateBookingStatus(booking.id, "complete")}
                              disabled={bookingActionLoading === booking.id}
                              className="whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Mark completed
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!bookingsLoading && filteredBookings.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No bookings match your search.
                        </td>
                      </tr>
                    )}
                    {bookingsLoading && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">Loading bookings...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!searchQuery.trim() && filteredBookings.length > 5 && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllBookings((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {showAllBookings ? "Show less" : `View all ${filteredBookings.length} bookings`}
                  <ChevronDown size={16} className={showAllBookings ? "rotate-180" : ""} />
                </button>
              </div>
            )}

            {bookingsError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {bookingsError} <button className="font-semibold underline" onClick={() => window.location.reload()}>Retry</button>
              </p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Bookings and status changes are loaded from the backend.
            </p>
          </section>
  );
}
