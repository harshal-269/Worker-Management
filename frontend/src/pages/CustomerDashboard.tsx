
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Ban,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Star,
  UserRound,
  Settings,
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Snowflake,
  Hammer,
  X,
} from "lucide-react";
import api from "../api/axios";
import NotificationBell from "./NotificationBell";

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

type Booking = {
  id: number;
  customerId: number;
  workerId: number;
  serviceId: number;
  serviceName: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  workerName?: string | null;
  workerEmail?: string | null;
  workerPhone?: string | null;
  workerLocation?: string | null;
  workerExperience?: number | null;
  scheduledAt: string;
  address: string;
  problemDescription: string;
  status: BookingStatus;
  cancellationReason?: string | null;
  rejectionReason?: string | null;
  cancelledAt?: string | null;
  rejectedAt?: string | null;
};

type Worker = {
  id: number;
  name: string;
  location: string | null;
  experience: number;
  description: string | null;
  available: boolean;
  profileImage: string | null;
  services: ServiceOption[];
};

type ServiceOption = {
  id: number;
  name: string;
  description?: string | null;
  color?: string;
};

type CustomerProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

type Review = {
  id: number;
  bookingId: number;
  customerId: number;
  workerId: number;
  workerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type WorkerRating = {
  averageRating: number;
  reviewCount: number;
};

type BookingForm = {
  scheduledAt: string;
  address: string;
  problemDescription: string;
  serviceId: string;
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

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Find Workers", icon: Search },
  { label: "My Bookings", icon: CalendarDays },
  { label: "My Reviews", icon: Star },
  { label: "My Profile", icon: UserRound },
  { label: "Settings", icon: Settings },
];

function BookingStatusTimeline({ status }: { status: BookingStatus }) {
  const steps: { status: BookingStatus; label: string; description: string }[] = [
    { status: "PENDING", label: "Request placed", description: "Your booking request has been sent." },
    { status: "ACCEPTED", label: "Accepted", description: "The worker has accepted your request." },
    { status: "IN_PROGRESS", label: "Work in progress", description: "The service is currently underway." },
    { status: "COMPLETED", label: "Completed", description: "The service has been completed." },
  ];

  const currentIndex = steps.findIndex((step) => step.status === status);
  const isClosed = status === "REJECTED" || status === "CANCELLED";

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-slate-900">Booking progress</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.PENDING}`}>
          {formatStatus(status)}
        </span>
      </div>

      {isClosed ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4">
          <Ban size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">
              {status === "REJECTED" ? "This booking was rejected." : "This booking was cancelled."}
            </p>
            <p className="mt-1 text-sm text-red-700">
              {status === "REJECTED"
                ? "The worker could not accept this request. You can choose another available professional."
                : "This booking is no longer active."}
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-5 space-y-0">
          {steps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                {index < steps.length - 1 && (
                  <span className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                    index < currentIndex ? "bg-emerald-500" : "bg-slate-200"
                  }`} />
                )}
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isComplete || isCurrent
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-slate-200 bg-white text-slate-400"
                }`}>
                  {isComplete ? <CheckCircle2 size={17} /> : index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className={`font-semibold ${isCurrent ? "text-emerald-700" : isComplete ? "text-slate-800" : "text-slate-400"}`}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-xs font-bold uppercase tracking-wide text-emerald-600">Current</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingSortOrder, setBookingSortOrder] = useState("NEWEST");
  const [bookingGroup, setBookingGroup] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [bookingDetailsError, setBookingDetailsError] = useState("");

  const openBookingDetails = async (bookingId: number) => {
    setBookingDetailsLoading(true);
    setBookingDetailsError("");
    setSelectedBooking(null);
    try {
      const response = await api.get<Booking>(`/bookings/${bookingId}`);
      setSelectedBooking(response.data);
    } catch (error) {
      console.error("Unable to load booking details:", error);
      setBookingDetailsError("Unable to load booking details. Please try again.");
    } finally {
      setBookingDetailsLoading(false);
    }
  };

  const [workersError, setWorkersError] = useState("");

  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationError, setCancellationError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedService, setSelectedService] = useState("All Services");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const bookingsRequestInFlight = useRef(false);

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [workerRatings, setWorkerRatings] = useState<Record<number, WorkerRating>>({});

  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<Worker | null>(null);
  const [workerProfileLoading, setWorkerProfileLoading] = useState(false);
  const [workerProfileError, setWorkerProfileError] = useState("");
  const [workerProfileReviews, setWorkerProfileReviews] = useState<Review[]>([]);

  const [bookingWorker, setBookingWorker] = useState<Worker | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingFormError, setBookingFormError] = useState("");
  const [bookingFormSuccess, setBookingFormSuccess] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    scheduledAt: "",
    address: "",
    problemDescription: "",
    serviceId: "",
  });

  const customerName =
    customerProfile?.name || localStorage.getItem("name") || "Customer";

  const loadCustomerProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const response = await api.get<CustomerProfile>("/users/me");
      setCustomerProfile(response.data);
      setProfileForm({
        name: response.data.name ?? "",
        phone: response.data.phone ?? "",
      });
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
    } catch (error) {
      console.error("Failed to load customer profile:", error);
      setProfileError(
        "We could not load your profile. Please refresh the page or sign in again.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const saveCustomerProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await api.put<CustomerProfile>("/users/me", {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });

      setCustomerProfile(response.data);
      setProfileForm({
        name: response.data.name ?? "",
        phone: response.data.phone ?? "",
      });
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      setProfileEditing(false);
      setProfileSuccess("Your profile has been updated successfully.");
    } catch (error: any) {
      console.error("Failed to update customer profile:", error);
      setProfileError(
        error?.response?.data?.message ||
          "Could not update your profile. Please check your details and try again.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const loadBookings = useCallback(async (silent = false) => {
    if (bookingsRequestInFlight.current) return;

    bookingsRequestInFlight.current = true;

    if (!silent) {
      setBookingsLoading(true);
    }

    setBookingsError("");

    try {
      const response = await api.get<Booking[]>("/bookings/my/customer");
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to load customer bookings:", error);

      setBookingsError(
        "Could not load your bookings. Please log in again if your session has expired."
      );
    } finally {
      bookingsRequestInFlight.current = false;

      if (!silent) {
        setBookingsLoading(false);
      }
    }
  }, []);

  const loadMyReviews = useCallback(async () => {
    const workerIds = [...new Set(bookings.map((booking) => booking.workerId).filter(Boolean))];
    if (workerIds.length === 0) {
      setMyReviews([]);
      return;
    }

    setReviewsLoading(true);
    setReviewsError("");
    try {
      const responses = await Promise.all(
        workerIds.map((workerId) =>
          api.get<Review[]>(`/reviews/worker/${workerId}`),
        ),
      );
      const customerId = customerProfile?.id ?? bookings[0]?.customerId;
      const ownReviews = responses
        .flatMap((response) => response.data ?? [])
        .filter((review) => customerId != null && review.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyReviews(ownReviews);
    } catch (error) {
      console.error("Failed to load customer reviews:", error);
      setReviewsError("Could not load your reviews. Please try again.");
    } finally {
      setReviewsLoading(false);
    }
  }, [bookings, customerProfile?.id]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewBooking || reviewSubmitting) return;

    setReviewSubmitting(true);
    setReviewsError("");
    try {
      await api.post<Review>("/reviews", {
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewBooking(null);
      setReviewRating(5);
      setReviewComment("");
      await loadMyReviews();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      setReviewsError(
        error?.response?.data?.message ||
          "Could not submit your review. Make sure this booking is completed and has not already been reviewed.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const loadWorkersAndServices = useCallback(async () => {
    setWorkersLoading(true);
    setWorkersError("");
    try {
      const [workersResponse, servicesResponse] = await Promise.all([
        api.get<Worker[]>("/workers"),
        api.get<ServiceOption[]>("/services"),
      ]);

      setWorkers(workersResponse.data);
      setServiceOptions(servicesResponse.data);

      const ratingEntries = await Promise.all(
        (workersResponse.data ?? []).map(async (worker) => {
          try {
            const [ratingResponse, countResponse] = await Promise.all([
              api.get<{ averageRating: number }>(`/reviews/worker/${worker.id}/rating`),
              api.get<{ reviewCount: number }>(`/reviews/worker/${worker.id}/count`),
            ]);
            return [worker.id, {
              averageRating: Number(ratingResponse.data?.averageRating ?? 0),
              reviewCount: Number(countResponse.data?.reviewCount ?? 0),
            }] as const;
          } catch {
            return [worker.id, { averageRating: 0, reviewCount: 0 }] as const;
          }
        }),
      );
      setWorkerRatings(Object.fromEntries(ratingEntries));
    } catch (error) {
      console.error("Failed to load workers or services:", error);
      setWorkersError(
        "Could not load professionals. Confirm that the backend is running and customer access to GET /api/workers is enabled.",
      );
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data loading
    void loadBookings();
    void loadWorkersAndServices();

    // Poll for booking status updates every 10 seconds
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadBookings(true);
      }
    }, 10000);

    // Cleanup when dashboard unmounts
    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadBookings, loadWorkersAndServices]);

  useEffect(() => {
    if (bookings.length > 0) {
      void loadMyReviews();
    } else {
      setMyReviews([]);
    }
  }, [bookings, loadMyReviews]);

  const cancelBooking = async () => {
    if (!bookingToCancel || cancellingBookingId !== null) return;

    const reason = cancellationReason.trim();
    if (!reason) {
      setCancellationError("Please enter a reason for cancelling this booking.");
      return;
    }

    setCancellingBookingId(bookingToCancel.id);
    setCancellationError("");
    setBookingsError("");

    try {
      const response = await api.put<Booking>(
        `/bookings/${bookingToCancel.id}/cancel`,
        { reason },
      );

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingToCancel.id ? response.data : booking,
        ),
      );

      if (selectedBooking?.id === bookingToCancel.id) {
        setSelectedBooking(response.data);
      }

      setBookingToCancel(null);
      setCancellationReason("");
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      setCancellationError(
        error?.response?.data?.message ||
          "Could not cancel this booking. Only pending or accepted bookings can be cancelled.",
      );
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openWorkerProfile = async (worker: Worker) => {
    setSelectedWorkerProfile(worker);
    setWorkerProfileLoading(true);
    setWorkerProfileError("");
    setWorkerProfileReviews([]);
    try {
      const [profileResponse, reviewsResponse] = await Promise.all([
        api.get<Worker>(`/workers/${worker.id}`),
        api.get<Review[]>(`/reviews/worker/${worker.id}`),
      ]);
      setSelectedWorkerProfile(profileResponse.data);
      setWorkerProfileReviews(reviewsResponse.data ?? []);
    } catch (error) {
      console.error("Failed to load worker profile:", error);
      setWorkerProfileError("Could not load the complete worker profile. Please try again.");
    } finally {
      setWorkerProfileLoading(false);
    }
  };

  const openBookingForm = (worker: Worker) => {
    setSelectedWorkerProfile(null);
    setBookingWorker(worker);
    setBookingFormError("");
    setBookingFormSuccess("");
    const workerServices = worker.services ?? [];

    setBookingForm({
      scheduledAt: "",
      address: "",
      problemDescription: "",
      serviceId: workerServices[0] ? String(workerServices[0].id) : "",
    });
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingWorker) return;

    const workerServices = bookingWorker.services ?? [];
    const selectedWorkerService = workerServices.find(
      (service) => service.id === Number(bookingForm.serviceId),
    );

    if (!selectedWorkerService) {
      setBookingFormError(
        "This worker does not provide the selected service. Please choose one of their listed services.",
      );
      return;
    }

    setBookingSubmitting(true);
    setBookingFormError("");
    setBookingFormSuccess("");

    try {
      const response = await api.post<Booking>("/bookings", {
        workerId: bookingWorker.id,
        serviceId: Number(bookingForm.serviceId),
        scheduledAt: bookingForm.scheduledAt,
        address: bookingForm.address.trim(),
        problemDescription: bookingForm.problemDescription.trim(),
      });

      setBookings((current) => [response.data, ...current]);
      setBookingWorker(null);
      setBookingFormSuccess(`Booking #${response.data.id} created successfully.`);
      setBookingForm({
        scheduledAt: "",
        address: "",
        problemDescription: "",
        serviceId: "",
      });
      await loadBookings();
      document.getElementById("my-bookings")?.scrollIntoView({ behavior: "smooth" });
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      setBookingFormError(
        error?.response?.data?.message ||
          "Could not create the booking. Please confirm the worker is available and try again.",
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const terminalStatuses: BookingStatus[] = ["COMPLETED", "REJECTED", "CANCELLED"];
    const query = bookingSearch.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesStatus =
          bookingStatusFilter === "ALL" || booking.status === bookingStatusFilter;

        const matchesGroup =
          bookingGroup === "ALL" ||
          (bookingGroup === "ACTIVE" && !terminalStatuses.includes(booking.status)) ||
          (bookingGroup === "PAST" && terminalStatuses.includes(booking.status));

        const matchesSearch =
          !query ||
          (booking.workerName || "").toLowerCase().includes(query) ||
          (booking.serviceName || "").toLowerCase().includes(query) ||
          String(booking.id).includes(query);

        return matchesStatus && matchesGroup && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.scheduledAt).getTime();
        const dateB = new Date(b.scheduledAt).getTime();
        return bookingSortOrder === "OLDEST" ? dateA - dateB : dateB - dateA;
      });
  }, [bookings, bookingStatusFilter, bookingSearch, bookingSortOrder, bookingGroup]);

  const visibleBookings = showAllBookings
    ? filteredBookings
    : filteredBookings.slice(0, 3);

  const pendingBookingsCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const completedBookingsCount = bookings.filter((booking) => booking.status === "COMPLETED").length;

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const name = (worker.name || "").toLowerCase();
      const description = (worker.description || "").toLowerCase();
      const workerLocation = (worker.location || "").toLowerCase();

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        description.includes(searchTerm.toLowerCase());

      const matchesLocation =
        location.trim() === "" ||
        workerLocation.includes(location.toLowerCase());

      const matchesService =
        selectedService === "All Services" ||
        (worker.services ?? []).some(
          (service) =>
            service.name.toLowerCase() === selectedService.toLowerCase(),
        );

      return matchesSearch && matchesLocation && matchesService;
    });
  }, [workers, searchTerm, location, selectedService]);

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "W";

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://localhost:8080${path.startsWith("/") ? path : `/${path}`}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

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
              {initials(customerName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{customerName}</p>
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
                  setActiveSection(item.label);
                  if (item.label === "Dashboard") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  if (item.label === "Find Workers") {
                    document.getElementById("find-workers")?.scrollIntoView({ behavior: "smooth" });
                  }
                  if (item.label === "My Bookings") {
                    document.getElementById("my-bookings")?.scrollIntoView({ behavior: "smooth" });
                  }
                  if (item.label === "My Profile") {
                    setProfileSuccess("");
                    void loadCustomerProfile();
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  item.label === activeSection
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

      <div className="min-h-screen lg:pl-72">
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
              <p className="text-xs font-medium text-slate-500">CUSTOMER WORKSPACE</p>
              <h1 className="mt-1 text-lg font-extrabold text-slate-900">{activeSection}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">Welcome, {customerName}!</p>
                <p className="mt-1 text-xs text-slate-500">Customer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {initials(customerName)}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
          {activeSection === "My Profile" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Account settings</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">My Profile</h2>
                  <p className="mt-2 text-sm text-slate-500">View and manage your personal information.</p>
                </div>
                {!profileEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        name: customerProfile?.name ?? "",
                        phone: customerProfile?.phone ?? "",
                      });
                      setProfileError("");
                      setProfileSuccess("");
                      setProfileEditing(true);
                    }}
                    disabled={!customerProfile || profileLoading}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {profileError && (
                <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {profileError}
                  <button type="button" onClick={() => void loadCustomerProfile()} className="ml-2 font-bold underline">Retry</button>
                </div>
              )}
              {profileSuccess && (
                <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {profileSuccess}
                </div>
              )}

              {profileLoading ? (
                <div className="mt-8 rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">Loading your profile...</div>
              ) : customerProfile ? (
                <div className="mt-8">
                  <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 p-6 sm:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-2xl font-extrabold text-white">
                      {initials(customerProfile.name)}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-extrabold text-slate-900">{customerProfile.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{customerProfile.email}</p>
                      <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                        {customerProfile.role}
                      </span>
                    </div>
                  </div>

                  {profileEditing ? (
                    <form onSubmit={saveCustomerProfile} className="mt-8 space-y-5">
                      <div>
                        <label htmlFor="customer-profile-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                        <input
                          id="customer-profile-name"
                          type="text"
                          required
                          maxLength={100}
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="customer-profile-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                        <input
                          id="customer-profile-email"
                          type="email"
                          readOnly
                          value={customerProfile.email}
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-400">Email cannot be changed here because it identifies your active login session.</p>
                      </div>
                      <div>
                        <label htmlFor="customer-profile-phone" className="mb-2 block text-sm font-semibold text-slate-700">Phone number</label>
                        <input
                          id="customer-profile-phone"
                          type="tel"
                          maxLength={20}
                          value={profileForm.phone}
                          onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                          placeholder="Enter your phone number"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileEditing(false);
                            setProfileForm({
                              name: customerProfile.name,
                              phone: customerProfile.phone ?? "",
                            });
                            setProfileError("");
                          }}
                          disabled={profileSaving}
                          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileSaving || !profileForm.name.trim()}
                          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {profileSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Full name</p>
                        <p className="mt-2 font-semibold text-slate-800">{customerProfile.name}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email address</p>
                        <p className="mt-2 break-all font-semibold text-slate-800">{customerProfile.email}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone number</p>
                        <p className="mt-2 font-semibold text-slate-800">{customerProfile.phone || "Not provided"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Account type</p>
                        <p className="mt-2 font-semibold text-slate-800">{customerProfile.role}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Profile information is unavailable.
                </div>
              )}
            </section>
          ) : activeSection === "My Reviews" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Your feedback</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">My Reviews</h2>
                  <p className="mt-2 text-sm text-slate-500">Reviews you have submitted for completed bookings.</p>
                </div>
                <span className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700">{myReviews.length} reviews</span>
              </div>
              {reviewsError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{reviewsError}</p>}
              {reviewsLoading ? (
                <p className="py-12 text-center text-sm text-slate-500">Loading your reviews...</p>
              ) : myReviews.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                  <Star size={34} className="mx-auto text-slate-300" />
                  <h3 className="mt-3 font-bold text-slate-800">No reviews yet</h3>
                  <p className="mt-2 text-sm text-slate-500">After a booking is completed, you can leave a review from My Bookings.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {myReviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{review.workerName || `Worker #${review.workerId}`}</h3>
                          <p className="mt-1 text-xs text-slate-400">Booking #{review.bookingId} · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={16} className="fill-amber-400 text-amber-400" /> {review.rating}/5</div>
                      </div>
                      <div className="mt-4 flex gap-1">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}</div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.comment || "No written comment."}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : activeSection === "Settings" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Customer workspace</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Settings</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Account preferences will be available here in a later update.</p>
            </section>
          ) : (
            <>
          <section className="relative overflow-hidden rounded-3xl bg-emerald-700 p-7 text-white sm:p-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/40 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-emerald-200">YOUR LOCAL SERVICE COMPANION</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Find the right help
                  <br className="hidden sm:block" /> for your home.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-emerald-100">
                  Explore local professionals, compare their profiles, and request the services you need.
                </p>
                <button
                  type="button"
                  onClick={() => document.getElementById("find-workers")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Find a worker <ArrowRight size={18} />
                </button>
              </div>
              <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-7 md:block">
                <BriefcaseBusiness size={58} />
                <p className="mt-4 text-sm text-emerald-100">Your neighbourhood</p>
                <p className="mt-1 text-xl font-extrabold">Your trusted experts</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Total Bookings", value: String(bookings.length), subtitle: "Your service requests", icon: CalendarDays, color: "bg-blue-50 text-blue-600" },
              { title: "Pending Requests", value: String(pendingBookingsCount), subtitle: "Awaiting confirmation", icon: Clock, color: "bg-amber-50 text-amber-600" },
              { title: "Completed", value: String(completedBookingsCount), subtitle: "Successfully completed", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
              { title: "Reviews Given", value: String(myReviews.length), subtitle: "Your feedback", icon: Star, color: "bg-purple-50 text-purple-600" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="mt-3 text-3xl font-extrabold">{card.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${card.color}`}><Icon size={23} /></div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{card.subtitle}</p>
                </div>
              );
            })}
          </section>

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
                  <button type="button" onClick={() => document.getElementById("find-workers")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Find a worker</button>
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
                      onClick={() => setShowAllBookings((current) => !current)}
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

          <section id="find-workers" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">Find local professionals</h2>
              <p className="mt-2 text-sm text-slate-500">Search real worker profiles registered in LocalWorker.</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_200px_auto]">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <Search size={19} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Worker or description" aria-label="Search worker or description" className="w-full py-3.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <MapPin size={19} className="text-slate-400" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter location" aria-label="Filter workers by location" className="w-full py-3.5 text-sm outline-none" />
              </div>
              <select value={selectedService} onChange={(event) => setSelectedService(event.target.value)} aria-label="Filter by service" className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-emerald-500">
                <option>All Services</option>
                {serviceOptions.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}
              </select>
              <button type="button" onClick={() => { setSearchTerm(""); setLocation(""); setSelectedService("All Services"); }} className="rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-700">Clear</button>
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold sm:text-2xl">Browse services</h2>
                <p className="mt-2 text-sm text-slate-500">Choose a category to filter professional profiles.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {serviceOptions.map((service) => {
                const normalizedName = service.name.toLowerCase();
                const Icon =
                  normalizedName.includes("electric") ? Zap :
                  normalizedName.includes("plumb") ? Wrench :
                  normalizedName.includes("paint") ? Paintbrush :
                  normalizedName.includes("clean") ? Sparkles :
                  normalizedName.includes("ac") || normalizedName.includes("air condition") ? Snowflake :
                  normalizedName.includes("carpent") ? Hammer : BriefcaseBusiness;
                const serviceExists = workers.some((worker) =>
                  (worker.services ?? []).some((assignedService) => assignedService.id === service.id),
                );
                return (
                  <button
                    type="button"
                    key={service.id}
                    disabled={!serviceExists}
                    onClick={() => setSelectedService(service.name === selectedService ? "All Services" : service.name)}
                    className={`rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 ${selectedService === service.name ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}
                  >
                    <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <Icon size={24} />
                    </div>
                    <p className="mt-4 font-bold">{service.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {workers.filter((worker) =>
                        (worker.services ?? []).some((assignedService) => assignedService.id === service.id),
                      ).length} professionals
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-extrabold sm:text-2xl">Local professionals</h2>
                <p className="mt-2 text-sm text-slate-500">These profiles are loaded directly from the backend.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">{filteredWorkers.length} professionals found</span>
                <button type="button" onClick={() => void loadWorkersAndServices()} disabled={workersLoading} aria-label="Refresh workers" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  <RefreshCw size={16} className={workersLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {workersError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{workersError}</div>}

            {workersLoading ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading professionals...</div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {filteredWorkers.map((worker) => {
                  const imageUrl = getProfileImageUrl(worker.profileImage);
                  return (
                    <article key={worker.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div className="flex min-w-0 items-center gap-4">
                          {imageUrl ? (
                            <img src={imageUrl} alt={worker.name} className="h-14 w-14 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-extrabold text-emerald-700">{initials(worker.name || "Worker")}</div>
                          )}
                          <div className="min-w-0">
                            <h3 className="truncate font-extrabold">{worker.name || `Worker #${worker.id}`}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{worker.description || "Local service professional"}</p>
                          </div>
                        </div>
                        <span className={`ml-2 shrink-0 rounded-full px-3 py-1 text-xs font-bold ${worker.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {worker.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <div className="space-y-3 p-5">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={16} /> {worker.location || "Location not provided"}
                        </div>
                        <p className="text-sm text-slate-600"><span className="font-bold">{worker.experience} years</span> of professional experience</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Star size={16} className="fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">{(workerRatings[worker.id]?.averageRating ?? 0) > 0 ? workerRatings[worker.id].averageRating.toFixed(1) : "New"}</span>
                          <span className="text-slate-500">({workerRatings[worker.id]?.reviewCount ?? 0} reviews)</span>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Services offered</p>
                          {(worker.services ?? []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {worker.services.map((service) => (
                                <span key={service.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">No services added yet</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs text-slate-400">Worker ID: {worker.id}</span>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => void openWorkerProfile(worker)} className="flex-1 rounded-xl border border-emerald-200 px-3 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">View Profile</button>
                            <button
                              type="button"
                              disabled={!worker.available || (worker.services ?? []).length === 0}
                              onClick={() => openBookingForm(worker)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                            >
                              Book Now <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {filteredWorkers.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2 xl:col-span-3">
                    <Search size={35} className="mx-auto text-slate-400" />
                    <h3 className="mt-4 font-bold">No professionals found</h3>
                    <p className="mt-2 text-sm text-slate-500">{workers.length === 0 ? "No worker profiles have been registered yet." : "Try a different name, service, or location."}</p>
                    <button type="button" onClick={() => { setSearchTerm(""); setLocation(""); setSelectedService("All Services"); }} className="mt-4 font-bold text-emerald-700 hover:text-emerald-800">Clear filters</button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-extrabold">Are you a service professional?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Join LocalWorker and connect with customers in your area.</p>
              </div>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700">
                Join as a worker <ArrowRight size={17} />
              </Link>
            </div>
          </section>

          {selectedWorkerProfile && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedWorkerProfile(null); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="worker-profile-title" className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="relative bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 text-white sm:p-8">
                  <button type="button" aria-label="Close worker profile" onClick={() => setSelectedWorkerProfile(null)} className="absolute right-4 top-4 rounded-xl bg-white/15 p-2 hover:bg-white/25"><X size={20} /></button>
                  <div className="flex flex-col items-center gap-4 pr-8 sm:flex-row">
                    {getProfileImageUrl(selectedWorkerProfile.profileImage) ? <img src={getProfileImageUrl(selectedWorkerProfile.profileImage) || ""} alt={selectedWorkerProfile.name} className="h-24 w-24 rounded-3xl border-4 border-white/30 object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-extrabold">{initials(selectedWorkerProfile.name || "Worker")}</div>}
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">Professional profile</p>
                      <h2 id="worker-profile-title" className="mt-1 text-2xl font-extrabold">{selectedWorkerProfile.name}</h2>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedWorkerProfile.available ? "bg-white text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{selectedWorkerProfile.available ? "Available for bookings" : "Currently unavailable"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 p-6 sm:p-8">
                  {workerProfileLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading complete profile...</p> : (
                    <>
                      {workerProfileError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{workerProfileError}</p>}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4"><MapPin size={18} className="text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Location</p><p className="mt-1 font-bold text-slate-800">{selectedWorkerProfile.location || "Not provided"}</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><BriefcaseBusiness size={18} className="text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Experience</p><p className="mt-1 font-bold text-slate-800">{selectedWorkerProfile.experience} years</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><Star size={18} className="text-amber-500" /><p className="mt-2 text-xs text-slate-500">Customer rating</p><p className="mt-1 font-bold text-slate-800">{(workerRatings[selectedWorkerProfile.id]?.averageRating ?? 0) > 0 ? workerRatings[selectedWorkerProfile.id].averageRating.toFixed(1) : "New"} / 5</p><p className="text-xs text-slate-500">{workerRatings[selectedWorkerProfile.id]?.reviewCount ?? 0} reviews</p></div>
                      </div>
                      <div><h3 className="font-extrabold text-slate-900">About</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{selectedWorkerProfile.description || "This professional has not added a description yet."}</p></div>
                      <div><h3 className="font-extrabold text-slate-900">Services offered</h3><div className="mt-3 flex flex-wrap gap-2">{(selectedWorkerProfile.services ?? []).length ? selectedWorkerProfile.services.map(service => <span key={service.id} className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{service.name}</span>) : <p className="text-sm text-slate-500">No services listed.</p>}</div></div>
                      <div><div className="flex items-center justify-between"><h3 className="font-extrabold text-slate-900">Customer reviews</h3><span className="text-xs text-slate-500">{workerProfileReviews.length} total</span></div>
                        {workerProfileReviews.length ? <div className="mt-3 space-y-3">{workerProfileReviews.slice(0, 5).map(review => <article key={review.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-800">Booking #{review.bookingId}</span><span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={15} className="fill-amber-400 text-amber-400" />{review.rating}/5</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.comment || "No written comment."}</p><p className="mt-2 text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></article>)}</div> : <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No reviews yet. Be the first to share your experience after a completed booking.</p>}
                      </div>
                      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setSelectedWorkerProfile(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button><button type="button" disabled={!selectedWorkerProfile.available || !(selectedWorkerProfile.services ?? []).length} onClick={() => openBookingForm(selectedWorkerProfile)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">Book Now <ArrowRight size={16} /></button></div>
                    </>
                  )}
                </div>
              </section>
            </div>
          )}

          {reviewBooking && (
            <div className="fixed inset-0 z-[75] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
              <section role="dialog" aria-modal="true" aria-labelledby="review-form-title" className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-amber-600">Share your experience</p>
                    <h2 id="review-form-title" className="mt-2 text-2xl font-extrabold text-slate-900">Review your service</h2>
                    <p className="mt-1 text-sm text-slate-500">{reviewBooking.workerName || `Worker #${reviewBooking.workerId}`} · Booking #{reviewBooking.id}</p>
                  </div>
                  <button type="button" aria-label="Close review form" onClick={() => setReviewBooking(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
                </div>
                {reviewsError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{reviewsError}</p>}
                <form onSubmit={submitReview} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Your rating</label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }, (_, index) => (
                        <button key={index} type="button" onClick={() => setReviewRating(index + 1)} aria-label={`Rate ${index + 1} stars`} className="rounded-lg p-1 transition hover:scale-110">
                          <Star size={32} className={index < reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-slate-700">{reviewRating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-slate-700">Comment (optional)</label>
                    <textarea id="review-comment" rows={4} maxLength={1000} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Tell others about your experience..." className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
                    <p className="mt-1 text-right text-xs text-slate-400">{reviewComment.length}/1000</p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setReviewBooking(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={reviewSubmitting} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{reviewSubmitting ? "Submitting..." : "Submit review"}</button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {bookingWorker && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
              <section role="dialog" aria-modal="true" aria-labelledby="booking-form-title" className="my-8 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">New service request</p>
                    <h2 id="booking-form-title" className="mt-2 text-2xl font-extrabold text-slate-900">Book {bookingWorker.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{bookingWorker.description || "Local service professional"}</p>
                  </div>
                  <button type="button" aria-label="Close booking form" onClick={() => setBookingWorker(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
                </div>

                {bookingFormError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bookingFormError}</div>}

                <form onSubmit={submitBooking} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="booking-service" className="mb-2 block text-sm font-semibold text-slate-700">Service required</label>
                    <select id="booking-service" required value={bookingForm.serviceId} onChange={(event) => setBookingForm((current) => ({ ...current, serviceId: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500">
                      <option value="">Select a service</option>
                      {(bookingWorker.services ?? []).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="booking-scheduled-at" className="mb-2 block text-sm font-semibold text-slate-700">Date and time</label>
                    <input id="booking-scheduled-at" type="datetime-local" required min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} value={bookingForm.scheduledAt} onChange={(event) => setBookingForm((current) => ({ ...current, scheduledAt: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </div>

                  <div>
                    <label htmlFor="booking-address" className="mb-2 block text-sm font-semibold text-slate-700">Service address</label>
                    <input id="booking-address" type="text" required minLength={5} maxLength={250} value={bookingForm.address} onChange={(event) => setBookingForm((current) => ({ ...current, address: event.target.value }))} placeholder="House/flat, street, area, city" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </div>

                  <div>
                    <label htmlFor="booking-problem" className="mb-2 block text-sm font-semibold text-slate-700">Describe the problem</label>
                    <textarea id="booking-problem" required minLength={5} maxLength={1000} rows={4} value={bookingForm.problemDescription} onChange={(event) => setBookingForm((current) => ({ ...current, problemDescription: event.target.value }))} placeholder="Explain what service you need..." className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setBookingWorker(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={bookingSubmitting || !bookingForm.serviceId || (bookingWorker.services ?? []).length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                      <Plus size={17} /> {bookingSubmitting ? "Submitting..." : "Submit booking"}
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

          {(bookingDetailsLoading || bookingDetailsError || selectedBooking) && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" onClick={() => { setSelectedBooking(null); setBookingDetailsError(""); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="customer-booking-details-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Booking information</p>
                    <h2 id="customer-booking-details-title" className="mt-1 text-2xl font-extrabold text-slate-900">Booking details</h2>
                  </div>
                  <button type="button" onClick={() => { setSelectedBooking(null); setBookingDetailsError(""); }} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
                </div>
                {bookingDetailsLoading ? <p className="py-12 text-center text-sm text-slate-500">Loading booking details...</p> :
                  bookingDetailsError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{bookingDetailsError}</p> :
                  selectedBooking && <>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="font-bold text-slate-900">Booking #{selectedBooking.id}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[selectedBooking.status] || statusStyles.PENDING}`}>{formatStatus(selectedBooking.status)}</span>
                    </div>
                    <BookingStatusTimeline status={selectedBooking.status} />
                    {(selectedBooking.status === "CANCELLED" || selectedBooking.status === "REJECTED") && (
                      <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                        <h3 className="font-bold text-red-900">
                          {selectedBooking.status === "CANCELLED" ? "Cancellation reason" : "Rejection reason"}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-red-800">
                          {(selectedBooking.status === "CANCELLED"
                            ? selectedBooking.cancellationReason
                            : selectedBooking.rejectionReason) || "No reason was provided."}
                        </p>
                        {(selectedBooking.cancelledAt || selectedBooking.rejectedAt) && (
                          <p className="mt-2 text-xs text-red-700">
                            {formatBookingDate(
                              (selectedBooking.status === "CANCELLED"
                                ? selectedBooking.cancelledAt
                                : selectedBooking.rejectedAt) || "",
                            )}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-semibold uppercase text-slate-400">Service</p><p className="mt-1 font-semibold text-slate-800">{selectedBooking.serviceName}</p></div>
                      <div><p className="text-xs font-semibold uppercase text-slate-400">Scheduled</p><p className="mt-1 font-semibold text-slate-800">{formatBookingDate(selectedBooking.scheduledAt)}</p></div>
                      <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">Service address</p><p className="mt-1 text-sm text-slate-700">{selectedBooking.address}</p></div>
                      <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">Problem description</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{selectedBooking.problemDescription || "No description provided."}</p></div>
                    </div>
                    <div className="mt-6 rounded-2xl border border-emerald-100 p-5">
                      <h3 className="font-bold text-slate-900">Your service professional</h3>
                      <p className="mt-3 font-semibold text-slate-800">{selectedBooking.workerName || `Worker #${selectedBooking.workerId}`}</p>
                      <p className="mt-1 text-sm text-slate-600">{selectedBooking.workerEmail || "Email not available"}</p>
                      <p className="mt-1 text-sm text-slate-600">{selectedBooking.workerPhone || "Phone not available"}</p>
                      {selectedBooking.workerLocation && <p className="mt-1 text-sm text-slate-600">{selectedBooking.workerLocation}</p>}
                      {selectedBooking.workerExperience != null && <p className="mt-1 text-sm text-slate-600">{selectedBooking.workerExperience} years experience</p>}
                    </div>
                  </>}
              </section>
            </div>
          )}

          {bookingToCancel && (
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4"
              onClick={() => {
                if (cancellingBookingId === null) {
                  setBookingToCancel(null);
                  setCancellationReason("");
                  setCancellationError("");
                }
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-booking-title"
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-600">Booking cancellation</p>
                    <h2 id="cancel-booking-title" className="mt-1 text-xl font-extrabold text-slate-900">
                      Cancel booking #{bookingToCancel.id}?
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Please tell the worker why you need to cancel this booking.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close cancellation dialog"
                    disabled={cancellingBookingId !== null}
                    onClick={() => {
                      setBookingToCancel(null);
                      setCancellationReason("");
                      setCancellationError("");
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                <label htmlFor="cancellation-reason" className="mt-5 block text-sm font-semibold text-slate-700">
                  Reason for cancellation
                </label>
                <textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(event) => {
                    setCancellationReason(event.target.value);
                    setCancellationError("");
                  }}
                  maxLength={1000}
                  rows={4}
                  placeholder="Enter your reason..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  disabled={cancellingBookingId !== null}
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Required · Maximum 1,000 characters</span>
                  <span>{cancellationReason.length}/1000</span>
                </div>

                {cancellationError && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {cancellationError}
                  </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={cancellingBookingId !== null}
                    onClick={() => {
                      setBookingToCancel(null);
                      setCancellationReason("");
                      setCancellationError("");
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Keep booking
                  </button>
                  <button
                    type="button"
                    onClick={() => void cancelBooking()}
                    disabled={cancellingBookingId !== null || !cancellationReason.trim()}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingBookingId !== null ? "Cancelling..." : "Confirm cancellation"}
                  </button>
                </div>
              </section>
            </div>
          )}

          <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} LocalWorker. Connecting communities with local professionals.
          </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboard;
