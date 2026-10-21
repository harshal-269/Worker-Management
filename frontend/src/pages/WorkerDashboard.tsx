import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  Star,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  Wrench,
  Zap,
  ShieldCheck,
  Bell,
  Search,
  Check,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

interface Worker {
  id: number;
  name: string;
  location: string;
  experience: number;
  description: string;
  available: boolean;
  profileImage: string | null;
}

interface Booking {
  id: number;
  customerId: number;
  workerId: number;
  serviceId: number;
  serviceName: string;
  scheduledAt: string;
  address: string;
  problemDescription: string;
  status: BookingStatus;
}

const services = [
  {
    name: "Plumbing",
    description: "Tap repair, pipe installation and leakage repair",
    price: "₹300 onwards",
    icon: Wrench,
  },
  {
    name: "Electrical Repairs",
    description: "Wiring, switches and electrical troubleshooting",
    price: "₹400 onwards",
    icon: Zap,
  },
  {
    name: "Home Maintenance",
    description: "General household repair and maintenance",
    price: "₹500 onwards",
    icon: BriefcaseBusiness,
  },
];

const reviews = [
  {
    name: "Amit Patil",
    date: "12 Oct 2026",
    rating: 5,
    comment: "Very professional service. The work was completed on time.",
  },
  {
    name: "Sneha Deshmukh",
    date: "08 Oct 2026",
    rating: 5,
    comment: "Excellent work and reasonable pricing. Highly recommended!",
  },
  {
    name: "Rahul Jadhav",
    date: "02 Oct 2026",
    rating: 4,
    comment: "Good experience. The issue was fixed properly.",
  },
];

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "My Bookings", icon: ClipboardList, id: "bookings" },
  { label: "My Services", icon: BriefcaseBusiness, id: "services" },
  { label: "Reviews", icon: Star, id: "reviews" },
  { label: "My Profile", icon: UserRound, id: "profile" },
];

function WorkerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const [worker, setWorker] = useState<Worker | null>(null);
  const [workerLoading, setWorkerLoading] = useState(true);
  const [workerError, setWorkerError] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [isAvailable, setIsAvailable] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingActionLoading, setBookingActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let imageObjectUrl: string | null = null;
    let cancelled = false;

    const loadWorker = async () => {
      try {
        setWorkerLoading(true);
        setWorkerError("");

        // Fetch worker details using the existing JWT-enabled Axios client.
        const response = await api.get<Worker>("/workers/2");

        if (cancelled) return;

        setWorker(response.data);
        setIsAvailable(response.data.available);

        // Load the profile image through Axios so the JWT is attached.
        if (response.data.profileImage) {
          try {
            const imagePath = response.data.profileImage.replace(/^\/api/, "");

            const imageResponse = await api.get<Blob>(imagePath, {
              responseType: "blob",
            });

            if (cancelled) return;

            imageObjectUrl = URL.createObjectURL(imageResponse.data);
            setProfileImageUrl(imageObjectUrl);
          } catch (imageError) {
            console.error("Unable to load profile image:", imageError);
          }
        }
      } catch (error) {
        console.error("Unable to load worker profile:", error);

        if (!cancelled) {
          setWorkerError(
            "Unable to load worker profile. Please refresh the page and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setWorkerLoading(false);
        }
      }
    };

    void loadWorker();

    return () => {
      cancelled = true;

      if (imageObjectUrl) {
        URL.revokeObjectURL(imageObjectUrl);
      }
    };
  }, []);

  useEffect(() => {
    void loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");
      const response = await api.get<Booking[]>("/bookings/my");
      setBookings(response.data);
    } catch (error) {
      console.error("Unable to load worker bookings:", error);
      setBookingsError("Unable to load bookings. Please refresh and try again.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const workerName = worker?.name ?? "Worker";

  const workerInitials =
    workerName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "W";

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const updateBookingStatus = async (
    bookingId: number,
    action: "accept" | "reject" | "start" | "complete",
  ) => {
    try {
      setBookingActionLoading(bookingId);
      setBookingsError("");
      const response = await api.put<Booking>(`/bookings/${bookingId}/${action}`);
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId ? response.data : booking,
        ),
      );
    } catch (error) {
      console.error(`Unable to ${action} booking:`, error);
      setBookingsError(`Unable to ${action} booking. Please try again.`);
    } finally {
      setBookingActionLoading(null);
    }
  };

  const formatBookingDate = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return Number.isNaN(date.getTime())
      ? scheduledAt
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const formatBookingTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getCustomerLabel = (booking: Booking) => `Customer #${booking.customerId}`;

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase();

    return (
      getCustomerLabel(booking).toLowerCase().includes(query) ||
      booking.serviceName.toLowerCase().includes(query) ||
      booking.address.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700";
      case "ACCEPTED":
        return "bg-blue-50 text-blue-700";
      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: BookingStatus) =>
    status.replaceAll("_", " ");

  const ProfileAvatar = ({
    size = "h-11 w-11",
  }: {
    size?: string;
  }) => (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700`}
    >
      {profileImageUrl ? (
        <img
          src={profileImageUrl}
          alt={`${workerName} profile`}
          className="h-full w-full object-cover"
        />
      ) : (
        workerInitials
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Wrench size={22} />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
            <ProfileAvatar />

            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {workerLoading ? "Loading profile..." : workerName}
              </p>
              <p className="text-xs text-emerald-700">
                Service Professional
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          WORKSPACE
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigateToSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <Icon size={19} />
                {item.label}

                {item.id === "bookings" && pendingBookings > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white text-emerald-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {pendingBookings}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => navigateToSection("settings")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "settings"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Settings size={19} />
            Settings
          </button>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("email");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm text-gray-500">Worker Workspace</p>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              className="relative rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {pendingBookings > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <ProfileAvatar size="h-10 w-10" />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {workerName}
                </p>
                <p className="text-xs text-gray-500">Worker Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
          {/* Loading and error messages */}
          {workerLoading && (
            <div className="rounded-xl border border-emerald-100 bg-white p-5 text-sm text-emerald-700">
              Loading your worker profile...
            </div>
          )}

          {workerError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
            >
              {workerError}
              <button
                onClick={() => window.location.reload()}
                className="ml-2 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Overview */}
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
                  <p className="mt-2 text-sm text-gray-600">
                    {worker.description}
                  </p>
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
                </div>

                <button
                  onClick={() =>
                    window.alert(
                      "Availability updates will be connected to the backend in the next phase.",
                    )
                  }
                  role="switch"
                  aria-checked={isAvailable}
                  aria-label="Worker availability"
                  className={`relative h-7 w-12 rounded-full transition ${
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

            {/* Statistics */}
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

                    <p className="mt-4 text-xs text-gray-500">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Upcoming bookings and earnings */}
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
                    onClick={() => navigateToSection("bookings")}
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
                              {formatBookingDate(booking.scheduledAt)} · {formatBookingTime(booking.scheduledAt)}
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
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-700 p-6 text-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <TrendingUp size={25} />
                </div>

                <p className="mt-6 text-sm text-emerald-100">
                  Your earnings
                </p>

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

          {/* Bookings */}
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
                    {filteredBookings.map((booking) => (
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
                          {booking.status === "PENDING" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void updateBookingStatus(booking.id, "accept")}
                                disabled={bookingActionLoading === booking.id}
                                title="Accept booking"
                                aria-label={`Accept booking ${booking.id}`}
                                className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => void updateBookingStatus(booking.id, "reject")}
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
                              onClick={() => void updateBookingStatus(booking.id, "start")}
                              disabled={bookingActionLoading === booking.id}
                              className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              Start job
                            </button>
                          ) : booking.status === "IN_PROGRESS" ? (
                            <button
                              onClick={() => void updateBookingStatus(booking.id, "complete")}
                              disabled={bookingActionLoading === booking.id}
                              className="whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Mark completed
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
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

            {bookingsError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {bookingsError} <button className="font-semibold underline" onClick={() => void loadBookings()}>Retry</button>
              </p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Bookings and status changes are loaded from the backend.
            </p>
          </section>

          {/* Services */}
          <section id="services" className="scroll-mt-28">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  WHAT YOU OFFER
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  My Services
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Services customers can request from you.
                </p>
              </div>

              <button
                onClick={() =>
                  window.alert(
                    "Service management will be connected to the backend in a later phase.",
                  )
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                + Add Service
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.name}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon size={24} />
                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Demo
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                      {service.name}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                      {service.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {service.price}
                      </span>

                      <button
                        onClick={() =>
                          window.alert(
                            "Editing services will be connected to the backend later.",
                          )
                        }
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                CUSTOMER FEEDBACK
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                See what customers say about your services.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {review.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {review.date}
                        </p>
                      </div>
                    </div>

                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>

                  <div className="mt-5 flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={
                          index < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Reviews are demonstration data and are not connected to the
              backend yet.
            </p>
          </section>

          {/* Profile */}
          <section id="profile" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                YOUR ACCOUNT
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                My Profile
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your professional information displayed to customers.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700 ring-4 ring-emerald-50">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={`${workerName} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    workerInitials
                  )}
                </div>

                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {workerLoading ? "Loading..." : workerName}
                </h3>

                <p className="mt-1 text-sm text-emerald-700">
                  Service Professional
                </p>

                <div className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-600">
                  <MapPin size={16} />
                  {worker?.location ?? "Location unavailable"}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <BriefcaseBusiness
                    size={16}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-gray-900">
                    {worker ? `${worker.experience} years` : "—"}
                  </span>
                  <span className="text-gray-500">experience</span>
                </div>

                <button
                  onClick={() =>
                    window.alert(
                      "Profile editing will be connected to the backend in a later phase.",
                    )
                  }
                  className="mt-6 w-full rounded-xl border border-emerald-600 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Edit Profile
                </button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Professional Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your work details retrieved from the backend.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <UserRound size={17} />
                      Full Name
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">
                      {worker?.name ?? "Not available"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={17} />
                      Email Address
                    </div>
                    <p className="mt-2 break-all font-semibold text-gray-900">
                      {localStorage.getItem("email") ?? "Not available"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={17} />
                      Account Status
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">
                      {worker
                        ? worker.available
                          ? "Available"
                          : "Unavailable"
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BriefcaseBusiness size={17} />
                      Experience
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">
                      {worker ? `${worker.experience} years` : "Not available"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={17} />
                      Service Location
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">
                      {worker?.location ?? "Not available"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Wrench size={17} />
                      Professional Description
                    </div>
                    <p className="mt-2 leading-6 text-gray-700">
                      {worker?.description ?? "Not available"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={21}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <p className="font-semibold text-emerald-900">
                        Professional profile
                      </p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        Your profile details are loaded from the LocalWorker
                        backend. Profile editing will be added separately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Settings */}
          <section id="settings" className="scroll-mt-28">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Settings size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Account preferences and availability.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    Accept new bookings
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Current availability is loaded from your worker profile.
                    Saving changes will be implemented in a later phase.
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.alert(
                      "Availability updates are not connected to the backend yet.",
                    )
                  }
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    isAvailable
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isAvailable
                    ? "Currently Available"
                    : "Currently Unavailable"}
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            <p>
              © 2026 LocalWorker. Built to connect communities with trusted
              professionals.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Worker profile and bookings come from the backend. Services and
              reviews still use demonstration data.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default WorkerDashboard;
