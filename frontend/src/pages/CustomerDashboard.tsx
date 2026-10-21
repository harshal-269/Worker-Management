import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  Star,
  UserRound,
  Settings,
  LogOut,
  MapPin,
  Clock,
  ArrowRight,
  Bell,
  Menu,
  X,
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Snowflake,
  Hammer,
  CheckCircle2,
  BriefcaseBusiness,
  RefreshCw,
  Ban,
  Plus,
} from "lucide-react";


type BookingStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "CANCELLED";

type Booking = {
  id: number;
  customerId: number;
  workerId: number;
  serviceId: number;
  serviceName: string;
  scheduledAt: string;
  address: string;
  problemDescription: string;
  status: BookingStatus;
};

type BookingForm = {
  scheduledAt: string;
  address: string;
  problemDescription: string;
};

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

const formatStatus = (status: BookingStatus) =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatBookingDate = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const services = [
  { name: "Plumbing", icon: Wrench, color: "bg-blue-100 text-blue-600" },
  { name: "Electrical", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { name: "Painting", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { name: "Cleaning", icon: Sparkles, color: "bg-emerald-100 text-emerald-600" },
  { name: "AC Repair", icon: Snowflake, color: "bg-cyan-100 text-cyan-600" },
  { name: "Carpentry", icon: Hammer, color: "bg-orange-100 text-orange-600" },
];

const workers = [
  {
    id: 1,
    name: "Rahul Sharma",
    profession: "Plumbing Specialist",
    location: "Sangamner",
    experience: 5,
    rating: 4.8,
    reviews: 42,
    available: true,
    initials: "RS",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "Amit Patil",
    profession: "Electrical Technician",
    location: "Sangamner",
    experience: 4,
    rating: 4.7,
    reviews: 35,
    available: true,
    initials: "AP",
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: 3,
    name: "Sneha Deshmukh",
    profession: "Home Cleaning Specialist",
    location: "Sangamner",
    experience: 3,
    rating: 4.9,
    reviews: 28,
    available: false,
    initials: "SD",
    color: "bg-purple-100 text-purple-700",
  },
];

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Find Workers", icon: Search, active: false },
  { label: "My Bookings", icon: CalendarDays, active: false },
  { label: "My Reviews", icon: Star, active: false },
  { label: "My Profile", icon: UserRound, active: false },
  { label: "Settings", icon: Settings, active: false },
];

function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedService, setSelectedService] = useState("All Services");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingWorker, setBookingWorker] = useState<(typeof workers)[number] | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingFormError, setBookingFormError] = useState("");
  const [bookingFormSuccess, setBookingFormSuccess] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    scheduledAt: "",
    address: "",
    problemDescription: "",
  });

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const response = await api.get<Booking[]>("/bookings/my/customer");
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to load customer bookings:", error);
      setBookingsError("Could not load your bookings. Please log in again if your session has expired.");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const cancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    setCancellingBookingId(bookingId);
    setBookingsError("");
    try {
      const response = await api.put<Booking>(`/bookings/${bookingId}/cancel`);
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId ? response.data : booking,
        ),
      );
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setBookingsError("Could not cancel this booking. Only pending or accepted bookings can be cancelled.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openBookingForm = (worker: (typeof workers)[number]) => {
    setBookingWorker(worker);
    setBookingFormError("");
    setBookingFormSuccess("");
    setBookingForm({
      scheduledAt: "",
      address: "",
      problemDescription: "",
    });
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingWorker) return;

    setBookingSubmitting(true);
    setBookingFormError("");
    setBookingFormSuccess("");

    try {
      // Current demo worker cards map to the backend's known electrician service.
      // Customer ID 5 is the test account used during current development.
      const response = await api.post<Booking>("/bookings", {
        customerId: 5,
        workerId: bookingWorker.id,
        serviceId: 1,
        scheduledAt: bookingForm.scheduledAt,
        address: bookingForm.address.trim(),
        problemDescription: bookingForm.problemDescription.trim(),
      });

      setBookings((currentBookings) => [response.data, ...currentBookings]);
      setBookingFormSuccess(`Booking #${response.data.id} created successfully.`);
      setBookingWorker(null);
      setBookingForm({
        scheduledAt: "",
        address: "",
        problemDescription: "",
      });
      await loadBookings();
      document.getElementById("my-bookings")?.scrollIntoView({ behavior: "smooth" });
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      setBookingFormError(
        error?.response?.data?.message ||
        "Could not create the booking. Check that the selected worker and service exist and that you are logged in as a customer."
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const pendingBookingsCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const completedBookingsCount = bookings.filter((booking) => booking.status === "COMPLETED").length;

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.profession.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      location.trim() === "" ||
      worker.location.toLowerCase().includes(location.toLowerCase());

    const matchesService =
      selectedService === "All Services" ||
      worker.profession.toLowerCase().includes(selectedService.toLowerCase());

    return matchesSearch && matchesLocation && matchesService;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white">
              L
            </div>
            <span className="text-xl font-extrabold">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              C
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900">Customer Account</p>
              <p className="mt-1 text-xs text-slate-500">Customer dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  setMobileMenuOpen(false);

                  if (item.label === "Find Workers") {
                    document.getElementById("find-workers")?.scrollIntoView({ behavior: "smooth" });
                  }
                  if (item.label === "My Bookings") {
                    document.getElementById("my-bookings")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  item.active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-72">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">
                CUSTOMER WORKSPACE
              </p>
              <h1 className="mt-1 text-lg font-extrabold text-slate-900">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">Welcome!</p>
                <p className="mt-1 text-xs text-slate-500">Customer</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                C
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
          {/* Welcome banner */}
          <section className="relative overflow-hidden rounded-3xl bg-emerald-700 p-7 text-white sm:p-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/40 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-emerald-200">
                  YOUR LOCAL SERVICE COMPANION
                </p>

                <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Find the right help
                  <br className="hidden sm:block" /> for your home.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-emerald-100">
                  Explore local professionals, compare their profiles,
                  and request the services you need.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("find-workers")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Find a worker
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-7 md:block">
                <BriefcaseBusiness size={58} />
                <p className="mt-4 text-sm text-emerald-100">
                  Your neighbourhood
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  Your trusted experts
                </p>
              </div>
            </div>
          </section>

          {/* Summary cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Bookings",
                value: String(bookings.length),
                subtitle: "Your service requests",
                icon: CalendarDays,
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Pending Requests",
                value: String(pendingBookingsCount),
                subtitle: "Awaiting confirmation",
                icon: Clock,
                color: "bg-amber-50 text-amber-600",
              },
              {
                title: "Completed",
                value: String(completedBookingsCount),
                subtitle: "Successfully completed",
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                title: "Reviews Given",
                value: "0",
                subtitle: "Your feedback",
                icon: Star,
                color: "bg-purple-50 text-purple-600",
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-extrabold">
                        {card.value}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${card.color}`}>
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}
          </section>

          {/* My bookings */}
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
                <RefreshCw size={16} className={bookingsLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {bookingsError && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{bookingsError}</p>
                <button type="button" onClick={() => void loadBookings()} className="mt-2 font-bold underline">Try again</button>
              </div>
            )}

            {bookingsLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <CalendarDays size={34} className="mx-auto text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-800">No bookings yet</h3>
                <p className="mt-2 text-sm text-slate-500">Your service requests will appear here after you book a worker.</p>
                <button type="button" onClick={() => document.getElementById("find-workers")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Find a worker</button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {bookings.map((booking) => (
                  <article key={booking.id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-extrabold text-slate-900">{booking.serviceName || `Service #${booking.serviceId}`}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status] || statusStyles.PENDING}`}>
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Booking #{booking.id} · Worker #{booking.workerId}</p>
                      </div>
                      {(booking.status === "PENDING" || booking.status === "ACCEPTED") && (
                        <button
                          type="button"
                          onClick={() => void cancelBooking(booking.id)}
                          disabled={cancellingBookingId === booking.id}
                          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Ban size={16} />
                          {cancellingBookingId === booking.id ? "Cancelling..." : "Cancel booking"}
                        </button>
                      )}
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
                    {booking.problemDescription && (
                      <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-700">Problem: </span>{booking.problemDescription}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Search workers */}
          <section
            id="find-workers"
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Find local professionals
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Search by worker name, profession, or location.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_200px_auto]">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <Search size={19} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Worker or profession"
                  aria-label="Search worker or profession"
                  className="w-full py-3.5 text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <MapPin size={19} className="text-slate-400" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Enter location"
                  aria-label="Filter workers by location"
                  className="w-full py-3.5 text-sm outline-none"
                />
              </div>

              <select
                value={selectedService}
                onChange={(event) => setSelectedService(event.target.value)}
                aria-label="Filter by service"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-emerald-500"
              >
                <option>All Services</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Cleaning</option>
                <option>Painting</option>
                <option>Carpentry</option>
                <option>AC Repair</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setSelectedService("All Services");
                }}
                className="rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-700"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Service categories */}
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  Browse services
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a category to discover professionals.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    type="button"
                    key={service.name}
                    onClick={() =>
                      setSelectedService(
                        service.name === selectedService
                          ? "All Services"
                          : service.name,
                      )
                    }
                    className={`rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                      selectedService === service.name
                        ? "border-emerald-500 ring-2 ring-emerald-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className={`inline-flex rounded-xl p-3 ${service.color}`}>
                      <Icon size={24} />
                    </div>

                    <p className="mt-4 font-bold">{service.name}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured workers */}
          <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  Local professionals
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Explore professionals and their profiles.
                </p>
              </div>

              <span className="text-sm font-semibold text-slate-500">
                {filteredWorkers.length} professionals found
              </span>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredWorkers.map((worker) => (
                <article
                  key={worker.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-extrabold ${worker.color}`}
                      >
                        {worker.initials}
                      </div>

                      <div>
                        <h3 className="font-extrabold">{worker.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {worker.profession}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        worker.available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {worker.available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <MapPin size={16} />
                        {worker.location}
                      </span>

                      <span className="flex items-center gap-1 font-bold">
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                        />
                        {worker.rating}
                        <span className="font-normal text-slate-400">
                          ({worker.reviews})
                        </span>
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      <span className="font-bold">{worker.experience} years</span>{" "}
                      of professional experience
                    </p>

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        disabled={!worker.available}
                        onClick={() => openBookingForm(worker)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        Request Booking
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {filteredWorkers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2 xl:col-span-3">
                  <Search
                    size={35}
                    className="mx-auto text-slate-400"
                  />

                  <h3 className="mt-4 font-bold">
                    No professionals found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try a different name, service, or location.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setLocation("");
                      setSelectedService("All Services");
                    }}
                    className="mt-4 font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Become a worker */}
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold">
                  Are you a service professional?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Join LocalWorker and connect with customers in your area.
                </p>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                Join as a worker
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>

          {bookingWorker && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-form-title"
                className="my-8 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">New service request</p>
                    <h2 id="booking-form-title" className="mt-2 text-2xl font-extrabold text-slate-900">Book {bookingWorker.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{bookingWorker.profession}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close booking form"
                    onClick={() => setBookingWorker(null)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {bookingFormError && (
                  <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {bookingFormError}
                  </div>
                )}

                <form onSubmit={submitBooking} className="mt-6 space-y-5">
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-800">Worker ID:</span> {bookingWorker.id}</p>
                    <p className="mt-1"><span className="font-semibold text-slate-800">Service:</span> Electrician (service ID 1)</p>
                  </div>

                  <div>
                    <label htmlFor="booking-scheduled-at" className="mb-2 block text-sm font-semibold text-slate-700">Date and time</label>
                    <input
                      id="booking-scheduled-at"
                      type="datetime-local"
                      required
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      value={bookingForm.scheduledAt}
                      onChange={(event) => setBookingForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-address" className="mb-2 block text-sm font-semibold text-slate-700">Service address</label>
                    <input
                      id="booking-address"
                      type="text"
                      required
                      minLength={5}
                      maxLength={250}
                      value={bookingForm.address}
                      onChange={(event) => setBookingForm((current) => ({ ...current, address: event.target.value }))}
                      placeholder="House/flat, street, area, city"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-problem" className="mb-2 block text-sm font-semibold text-slate-700">Describe the problem</label>
                    <textarea
                      id="booking-problem"
                      required
                      minLength={5}
                      maxLength={1000}
                      rows={4}
                      value={bookingForm.problemDescription}
                      onChange={(event) => setBookingForm((current) => ({ ...current, problemDescription: event.target.value }))}
                      placeholder="Explain what service you need..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setBookingWorker(null)}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus size={17} />
                      {bookingSubmitting ? "Submitting..." : "Submit booking"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {bookingFormSuccess && (
            <div role="status" className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl bg-emerald-700 px-5 py-4 text-sm font-semibold text-white shadow-xl">
              {bookingFormSuccess}
              <button type="button" onClick={() => setBookingFormSuccess("")} className="ml-3 underline">Dismiss</button>
            </div>
          )}

          <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} LocalWorker. Connecting communities
            with local professionals.
          </footer>
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboard;
