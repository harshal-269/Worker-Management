import {
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import type { Booking, Worker } from "../WorkerDashboard";

type WorkerOverviewProps = {
  worker: Worker | null;
  workerName: string;
  workerLoading: boolean;
  isAvailable: boolean;
  availabilityUpdating: boolean;
  availabilityError: string;
  bookings: Booking[];
  pendingBookings: number;
  completedBookings: number;
  onToggleAvailability: () => void;
  onNavigate: (sectionId: string) => void;
  formatBookingDate: (scheduledAt: string) => string;
  formatBookingTime: (scheduledAt: string) => string;
  getCustomerLabel: (booking: Booking) => string;
  getStatusStyle: (status: Booking["status"]) => string;
  getStatusLabel: (status: Booking["status"]) => string;
};

/** Overview page for the worker workspace. Business state remains in WorkerDashboard. */
export default function WorkerOverview({
  worker,
  workerName,
  workerLoading,
  isAvailable,
  availabilityUpdating,
  availabilityError,
  bookings,
  pendingBookings,
  completedBookings,
  onToggleAvailability,
  onNavigate,
  formatBookingDate,
  formatBookingTime,
  getCustomerLabel,
  getStatusStyle,
  getStatusLabel,
}: WorkerOverviewProps) {
  return (
    <section id="overview" className="scroll-mt-28">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-700">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {workerName}! 👋
          </h2>

          <p className="mt-2 text-gray-500">
            Here's what's happening with your business today.
          </p>

          {worker?.description && (
            <p className="mt-2 text-sm text-gray-600">{worker.description}</p>
          )}

          {worker?.location && (
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={15} />
              {worker.location}
            </p>
          )}
        </div>

        <div
          className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
            isAvailable
              ? "border-emerald-100 bg-emerald-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {isAvailable ? "You're available" : "You're unavailable"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isAvailable
                ? "Customers can request your services"
                : "New requests are paused"}
            </p>
            {availabilityUpdating && (
              <p className="mt-1 text-xs text-gray-500">
                Updating availability...
              </p>
            )}
            {availabilityError && (
              <p className="mt-1 text-xs text-red-600">{availabilityError}</p>
            )}
          </div>

          <button
            onClick={onToggleAvailability}
            disabled={availabilityUpdating || workerLoading || !worker}
            role="switch"
            aria-checked={isAvailable}
            aria-label="Worker availability"
            className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isAvailable ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                isAvailable ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Bookings",
            value: bookings.length,
            icon: ClipboardList,
            detail: "From your bookings",
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Pending Requests",
            value: pendingBookings,
            icon: Clock,
            detail: "Need your attention",
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Completed Jobs",
            value: completedBookings,
            icon: CheckCircle2,
            detail: "From your bookings",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Experience",
            value: worker ? `${worker.experience} yrs` : "—",
            icon: Star,
            detail: "Professional experience",
            color: "bg-purple-50 text-purple-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={22} />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Upcoming Bookings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your latest customer requests.
              </p>
            </div>
            <button
              onClick={() => onNavigate("bookings")}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {bookings
              .filter(
                (booking) =>
                  booking.status === "PENDING" ||
                  booking.status === "ACCEPTED" ||
                  booking.status === "IN_PROGRESS",
              )
              .slice(0, 3)
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {`C${booking.customerId}`}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getCustomerLabel(booking)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {booking.serviceName}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatBookingDate(booking.scheduledAt)} ·{" "}
                        {formatBookingTime(booking.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        booking.status,
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Booking #{booking.id}
                    </span>
                  </div>
                </div>
              ))}
            {!bookings.some(
              (booking) =>
                booking.status === "PENDING" ||
                booking.status === "ACCEPTED" ||
                booking.status === "IN_PROGRESS",
            ) && (
              <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                No upcoming bookings yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-700 p-6 text-white shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <TrendingUp size={25} />
          </div>
          <p className="mt-6 text-sm text-emerald-100">Your earnings</p>
          <h3 className="mt-2 text-4xl font-bold">Not available</h3>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100">
            <TrendingUp size={16} />
            <span>Earnings API integration pending</span>
          </div>
          <div className="mt-8 border-t border-white/20 pt-5">
            <p className="text-sm text-emerald-100">
              Your real earnings will appear here after we integrate the
              booking and payment data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
