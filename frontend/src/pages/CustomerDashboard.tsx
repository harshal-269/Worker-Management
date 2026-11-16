
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout, { type DashboardNavItem } from "../components/dashboard/DashboardLayout";
import CustomerOverview from "./customer/CustomerOverview";
import CustomerFindWorkers from "./customer/CustomerFindWorkers";
import CustomerBookings from "./customer/CustomerBookings";
import CustomerBills from "./customer/CustomerBills";
import CustomerReviews from "./customer/CustomerReviews";
import CustomerProfile from "./customer/CustomerProfile";
import CustomerSettings from "./customer/CustomerSettings";
import {
  ArrowRight,
  Ban,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Plus,
  Search,
  Star,
  UserRound,
  Settings,
  X,
} from "lucide-react";
import api from "../api/axios";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type Booking = {
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

export type Worker = {
  id: number;
  name: string;
  location: string | null;
  experience: number;
  description: string | null;
  available: boolean;
  profileImage: string | null;
  services: ServiceOption[];
};

export type ServiceOption = {
  id: number;
  name: string;
  description?: string | null;
  color?: string;
};

export type CustomerProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

export type Review = {
  id: number;
  bookingId: number;
  customerId: number;
  workerId: number;
  workerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type WorkerRating = {
  averageRating: number;
  reviewCount: number;
};

export type BookingForm = {
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

const formatStatus = (status?: string | null) =>
  (status ?? "UNKNOWN").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatBookingDate = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const sidebarItems = [
  { label: "Dashboard", path: "overview", icon: LayoutDashboard },
  { label: "Find Workers", path: "find-workers", icon: Search },
  { label: "My Bookings", path: "bookings", icon: CalendarDays },
  { label: "My Bills", path: "bills", icon: ClipboardList },
  { label: "My Reviews", path: "reviews", icon: Star },
  { label: "My Profile", path: "profile", icon: UserRound },
  { label: "Settings", path: "settings", icon: Settings },
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
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const currentSection = routerLocation.pathname.split("/").filter(Boolean).at(-1) ?? "overview";
  const sectionTitles: Record<string, string> = {
    overview: "Dashboard",
    "find-workers": "Find Workers",
    bookings: "My Bookings",
    bills: "My Bills",
    reviews: "My Reviews",
    profile: "My Profile",
    settings: "Settings",
  };
  const activeSection = sectionTitles[currentSection] ?? "Dashboard";

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

  useEffect(() => {
    if (currentSection === "profile") {
      setProfileSuccess("");
      void loadCustomerProfile();
    }
  }, [currentSection, loadCustomerProfile]);

  useEffect(() => {
    if (routerLocation.pathname === "/customer/dashboard") {
      navigate("/customer/dashboard/overview", { replace: true });
    } else if (!sectionTitles[currentSection]) {
      navigate("/customer/dashboard/overview", { replace: true });
    }
  }, [routerLocation.pathname, currentSection, navigate]);

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
      navigate("/customer/dashboard/bookings");
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

  const dashboardNavItems: DashboardNavItem[] = sidebarItems.map((item) => ({
    label: item.label,
    path: item.path,
    icon: item.icon,
  }));

  return (
    <DashboardLayout
      title={activeSection}
      description="Find trusted professionals and manage your service bookings."
      navItems={dashboardNavItems}
      basePath="/customer/dashboard"
      userName={customerName}
      roleLabel="Customer"
      userAvatar={
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
          {initials(customerName)}
        </span>
      }
    >
      <div className="space-y-8">
          {activeSection === "My Profile" && (
            <CustomerProfile
              customerProfile={customerProfile}
              profileEditing={profileEditing}
              profileLoading={profileLoading}
              profileError={profileError}
              profileSuccess={profileSuccess}
              profileForm={profileForm}
              profileSaving={profileSaving}
              setProfileForm={setProfileForm}
              setProfileError={setProfileError}
              setProfileSuccess={setProfileSuccess}
              setProfileEditing={setProfileEditing}
              loadCustomerProfile={loadCustomerProfile}
              saveCustomerProfile={saveCustomerProfile}
              initials={initials}
            />
          )}
          {activeSection === "My Reviews" && (
            <CustomerReviews
              myReviews={myReviews}
              reviewsError={reviewsError}
              reviewsLoading={reviewsLoading}
            />
          )}
          {activeSection === "Settings" && <CustomerSettings />}
          {activeSection !== "My Profile" &&
            activeSection !== "My Reviews" &&
            activeSection !== "Settings" && (
            <>
          {currentSection === "overview" && (
            <CustomerOverview
              totalBookings={bookings.length}
              pendingBookings={pendingBookingsCount}
              completedBookings={completedBookingsCount}
              reviewsGiven={myReviews.length}
              onFindWorkers={() => navigate("/customer/dashboard/find-workers")}
            />
          )}

          {currentSection === "bills" && (
            <div className="space-y-8">
              <CustomerBills bookings={bookings} />
            </div>
          )}

          {currentSection === "bookings" && (
            <CustomerBookings
              bookings={bookings}
              bookingsError={bookingsError}
              bookingsLoading={bookingsLoading}
              loadBookings={loadBookings}
              bookingSearch={bookingSearch}
              setBookingSearch={setBookingSearch}
              bookingStatusFilter={bookingStatusFilter}
              setBookingStatusFilter={setBookingStatusFilter}
              bookingGroup={bookingGroup}
              setBookingGroup={setBookingGroup}
              bookingSortOrder={bookingSortOrder}
              setBookingSortOrder={setBookingSortOrder}
              filteredBookings={filteredBookings}
              visibleBookings={visibleBookings}
              statusStyles={statusStyles}
              formatStatus={formatStatus}
              cancellingBookingId={cancellingBookingId}
              setBookingToCancel={setBookingToCancel}
              setCancellationReason={setCancellationReason}
              setCancellationError={setCancellationError}
              myReviews={myReviews}
              setReviewBooking={setReviewBooking}
              setReviewRating={setReviewRating}
              setReviewComment={setReviewComment}
              setReviewsError={setReviewsError}
              openBookingDetails={openBookingDetails}
              formatBookingDate={formatBookingDate}
              showAllBookings={showAllBookings}
              setShowAllBookings={setShowAllBookings}
              navigate={navigate}
            />
          )}

          {currentSection === "find-workers" && (
            <CustomerFindWorkers
              workers={workers}
              workersLoading={workersLoading}
              workersError={workersError}
              filteredWorkers={filteredWorkers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              location={location}
              setLocation={setLocation}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              serviceOptions={serviceOptions}
              workerRatings={workerRatings}
              getProfileImageUrl={getProfileImageUrl}
              initials={initials}
              openWorkerProfile={openWorkerProfile}
              openBookingForm={openBookingForm}
              loadWorkersAndServices={loadWorkersAndServices}
            />
          )}

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
      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
