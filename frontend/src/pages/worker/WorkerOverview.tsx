
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Power,
  Star,
  TrendingUp,
  Wallet,
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
  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.status === "PENDING" ||
        booking.status === "ACCEPTED" ||
        booking.status === "IN_PROGRESS",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 4);

  const stats = [
    {
      label: "Total bookings",
      value: bookings.length,
      detail: "All customer requests",
      icon: CalendarDays,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending requests",
      value: pendingBookings,
      detail: "Require your attention",
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "Completed jobs",
      value: completedBookings,
      detail: "Successfully completed",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Experience",
      value: worker ? `${worker.experience} yrs` : "—",
      detail: "Professional experience",
      icon: Star,
      iconStyle: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-6 text-white shadow-lg sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-36 right-1/3 -z-10 h-72 w-72 rounded-full bg-white/10" />

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-50">
              <TrendingUp size={14} />
              WORKER WORKSPACE
            </div>

            <p className="text-sm font-medium text-emerald-100">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {workerLoading ? "Welcome back!" : `Welcome back, ${workerName}!`}
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-7 text-emerald-50 sm:text-base">
              Here's what's happening with your business today. Manage your
              bookings, serve customers, and grow your professional presence.
            </p>

            {worker?.location && (
              <div className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-100">
                <MapPin size={16} />
                {worker.location}
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate("bookings")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Manage bookings
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Availability card */}
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-100">
                  Your availability
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {isAvailable ? "Available" : "Unavailable"}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Power size={23} />
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-emerald-50">
              {isAvailable
                ? "Customers can discover your profile and send booking requests."
                : "Your profile is currently unavailable for new booking requests."}
            </p>

            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              aria-label="Worker availability"
              onClick={onToggleAvailability}
              disabled={availabilityUpdating || workerLoading || !worker}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isAvailable
                  ? "bg-white text-emerald-800 hover:bg-emerald-50"
                  : "bg-emerald-950/30 text-white ring-1 ring-white/40 hover:bg-emerald-950/50"
              }`}
            >
              <Power size={16} />
              {availabilityUpdating
                ? "Updating availability..."
                : isAvailable
                  ? "Set as unavailable"
                  : "Set as available"}
            </button>

            {availabilityError && (
              <p role="alert" className="mt-3 text-xs text-red-100">
                {availabilityError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Professional profile summary */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BriefcaseBusiness size={26} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Professional profile
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-900">
              {workerLoading ? "Loading profile..." : workerName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {worker?.experience ?? 0} years of professional experience
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          View profile
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Performance statistics */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Performance
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Your activity
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A quick overview of your work on LocalWorker.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
                      {stat.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">{stat.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming bookings and earnings */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Latest activity
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                Upcoming bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Stay on top of your customer requests.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("bookings")}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <CalendarDays size={26} />
              </div>
              <h3 className="mt-4 font-bold text-gray-900">
                No upcoming bookings
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                New customer requests will appear here. Keep your availability
                turned on to receive bookings.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("services")}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Manage services
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-gray-50/70 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <UserRoundIcon />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-gray-900">
                        {getCustomerLabel(booking)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {booking.serviceName}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                        <span>
                          {formatBookingDate(booking.scheduledAt)}
                        </span>
                        <span>·</span>
                        <span>
                          {formatBookingTime(booking.scheduledAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                        booking.status,
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>

                    <span className="text-xs font-medium text-gray-400">
                      #{booking.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings placeholder */}
        <div className="relative isolate flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-700 p-6 text-white shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-white/10" />

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Wallet size={24} />
          </div>

          <p className="mt-6 text-sm font-medium text-emerald-100">
            Your earnings
          </p>

          <h3 className="mt-2 text-3xl font-extrabold">
            Not available
          </h3>

          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100">
            <TrendingUp size={16} />
            <span>Earnings integration pending</span>
          </div>

          <div className="mt-auto border-t border-white/20 pt-5">
            <p className="text-sm leading-6 text-emerald-50">
              Your earnings summary will appear here once booking and payment
              data are integrated.
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Shortcuts
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Quick actions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: "Manage bookings",
              description: "Review and respond to requests",
              icon: CalendarDays,
              style: "bg-blue-50 text-blue-600",
              section: "bookings",
            },
            {
              title: "Manage services",
              description: "Update services and prices",
              icon: BriefcaseBusiness,
              style: "bg-purple-50 text-purple-600",
              section: "services",
            },
            {
              title: "View reviews",
              description: "See what customers say",
              icon: Star,
              style: "bg-amber-50 text-amber-600",
              section: "reviews",
            },
          ].map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.section}
                type="button"
                onClick={() => onNavigate(action.section)}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.style}`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Profile reminder */}
      <section className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="font-bold text-emerald-950">
            Make your profile stand out
          </h3>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            Keep your professional information and service details up to date
            so customers know what you offer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Update profile
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

function UserRoundIcon() {
  return <Star size={20} />;
}
