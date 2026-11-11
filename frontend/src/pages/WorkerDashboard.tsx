import { useEffect, useRef, useState } from "react";
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
  ShieldCheck,
  Search,
  Check,
  ChevronDown,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

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

interface ServiceItem {
  id: number;
  name: string;
  description: string;
}

interface Booking {
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
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}

interface Review {
  id: number;
  bookingId: number;
  customerId: number;
  workerId: number;
  workerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    location: "",
    experience: 0,
    description: "",
  });

  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingActionLoading, setBookingActionLoading] = useState<number | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [bookingDetailsError, setBookingDetailsError] = useState("");

  const [workerServices, setWorkerServices] = useState<ServiceItem[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [serviceActionLoading, setServiceActionLoading] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [showAddService, setShowAddService] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!worker?.id) return;

    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const [reviewsResponse, ratingResponse, countResponse] = await Promise.all([
          api.get<Review[]>(`/reviews/worker/${worker.id}`),
          api.get<{ averageRating: number }>(`/reviews/worker/${worker.id}/rating`),
          api.get<{ reviewCount: number }>(`/reviews/worker/${worker.id}/count`),
        ]);

        if (cancelled) return;

        setReviews(reviewsResponse.data ?? []);
        setAverageRating(Number(ratingResponse.data?.averageRating ?? 0));
        setReviewCount(Number(countResponse.data?.reviewCount ?? 0));
      } catch (error) {
        console.error("Unable to load customer reviews:", error);
        if (!cancelled) {
          setReviewsError("Unable to load customer reviews. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [worker?.id]);

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


  useEffect(() => {
    let imageObjectUrl: string | null = null;
    let cancelled = false;

    const loadWorker = async () => {
      try {
        setWorkerLoading(true);
        setWorkerError("");

        // Fetch worker details using the existing JWT-enabled Axios client.
        const response = await api.get<Worker>("/workers/me");

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

  const openEditProfile = () => {
    if (!worker) return;

    setProfileForm({
      name: worker.name ?? "",
      location: worker.location ?? "",
      experience: worker.experience ?? 0,
      description: worker.description ?? "",
    });

    setProfileError("");
    setProfileSuccess("");
    setShowEditProfile(true);
  };

  const handleProfileUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!worker || profileSaving) return;

    try {
      setProfileSaving(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await api.put<Worker>("/workers/me/profile", {
        name: profileForm.name.trim(),
        location: profileForm.location.trim(),
        experience: Number(profileForm.experience),
        description: profileForm.description.trim(),
      });

      setWorker(response.data);
      setIsAvailable(response.data.available);
      setProfileSuccess("Profile updated successfully.");
      setShowEditProfile(false);
    } catch (error: any) {
      console.error("Unable to update worker profile:", error);
      setProfileError(
        error.response?.data?.message ||
          "Unable to update your profile. Please check your details and try again.",
      );
    } finally {
      setProfileSaving(false);
    }
  };


  const handleProfileImageSelection = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !worker || imageUploading) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please choose a JPG, PNG, or WebP image.");
      setImageSuccess("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be 5 MB or less.");
      setImageSuccess("");
      return;
    }

    setImageError("");
    setImageSuccess("");
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post<{
        message: string;
        workerId: number;
        filename: string;
        imageUrl: string;
      }>(`/images/upload/worker/${worker.id}`, formData);

      const imageResponse = await api.get<Blob>(
        `/images/${uploadResponse.data.filename}`,
        { responseType: "blob" },
      );

      const nextImageUrl = URL.createObjectURL(imageResponse.data);
      setProfileImageUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextImageUrl;
      });

      setWorker((currentWorker) =>
        currentWorker
          ? { ...currentWorker, profileImage: uploadResponse.data.imageUrl }
          : currentWorker,
      );

      setImageSuccess("Profile picture updated successfully.");
    } catch (error: any) {
      console.error("Unable to upload profile image:", error);
      setImageError(
        error.response?.data?.message ||
          "Unable to upload your profile picture. Please try again.",
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
      setImagePreviewUrl(null);
      setImageUploading(false);
    }
  };


useEffect(() => {
  let isMounted = true;
  let isFetching = false;

  const loadBookings = async (showLoading = false) => {
    if (isFetching) return;

    try {
      isFetching = true;

      if (showLoading && isMounted) {
        setBookingsLoading(true);
        setBookingsError("");
      }

      const response = await api.get<Booking[]>("/bookings/my");

      if (isMounted) {
        setBookings(response.data);
        setBookingsError("");
      }
    } catch (error) {
      console.error("Unable to load worker bookings:", error);

      if (isMounted && showLoading) {
        setBookingsError(
          "Unable to load bookings. Please refresh and try again.",
        );
      }
    } finally {
      isFetching = false;

      if (isMounted && showLoading) {
        setBookingsLoading(false);
      }
    }
  };

  // Load bookings immediately when the dashboard opens.
  void loadBookings(true);

  // Poll only while the dashboard tab is visible.
  const intervalId = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void loadBookings();
    }
  }, 10000);

  // Refresh immediately when the worker returns to this tab.
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      void loadBookings();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    isMounted = false;
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);


  const loadWorkerServices = async (showLoading = true) => {
    try {
      if (showLoading) {
        setServicesLoading(true);
      }
      setServicesError("");

      const [assignedResponse, catalogResponse] = await Promise.all([
        api.get<ServiceItem[]>("/workers/me/services"),
        api.get<ServiceItem[]>("/services"),
      ]);

      setWorkerServices(assignedResponse.data);
      setServiceCatalog(catalogResponse.data);
    } catch (error) {
      console.error("Unable to load worker services:", error);
      setServicesError("Unable to load services. Please try again.");
    } finally {
      if (showLoading) {
        setServicesLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadWorkerServices();
  }, []);

  const addWorkerService = async () => {
    const serviceId = Number(selectedServiceId);
    if (!serviceId || serviceActionLoading !== null) return;

    try {
      setServiceActionLoading(serviceId);
      setServicesError("");

      const response = await api.post<ServiceItem[]>(
        `/workers/me/services/${serviceId}`,
      );

      setWorkerServices(response.data);
      setSelectedServiceId("");
      setShowAddService(false);
    } catch (error) {
      console.error("Unable to add worker service:", error);
      setServicesError("Unable to add this service. Please try again.");
    } finally {
      setServiceActionLoading(null);
    }
  };

  const removeWorkerService = async (serviceId: number) => {
    if (serviceActionLoading !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this service from your profile?",
    );
    if (!confirmed) return;

    try {
      setServiceActionLoading(serviceId);
      setServicesError("");

      const response = await api.delete<ServiceItem[]>(
        `/workers/me/services/${serviceId}`,
      );

      setWorkerServices(response.data);
    } catch (error) {
      console.error("Unable to remove worker service:", error);
      setServicesError("Unable to remove this service. Please try again.");
    } finally {
      setServiceActionLoading(null);
    }
  };

  const availableServices = serviceCatalog.filter(
    (service) => !workerServices.some((assigned) => assigned.id === service.id),
  );

  const workerName = worker?.name ?? (workerLoading ? "Loading..." : "Worker");

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
    action: "accept" | "start" | "complete",
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
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(response.data);
      }
    } catch (error) {
      console.error(`Unable to ${action} booking:`, error);
      setBookingsError(`Unable to ${action} booking. Please try again.`);
    } finally {
      setBookingActionLoading(null);
    }
  };

  const openRejectBookingModal = (booking: Booking) => {
    setRejectingBooking(booking);
    setRejectionReason("");
    setRejectionError("");
  };

  const closeRejectBookingModal = () => {
    if (bookingActionLoading !== null) return;
    setRejectingBooking(null);
    setRejectionReason("");
    setRejectionError("");
  };

  const submitBookingRejection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rejectingBooking || bookingActionLoading !== null) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectionError("Please provide a reason for rejecting this booking.");
      return;
    }
    if (reason.length > 1000) {
      setRejectionError("The reason must not exceed 1000 characters.");
      return;
    }

    const bookingId = rejectingBooking.id;

    try {
      setBookingActionLoading(bookingId);
      setBookingsError("");
      setRejectionError("");

      const response = await api.put<Booking>(
        `/bookings/${bookingId}/reject`,
        { reason },
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId ? response.data : booking,
        ),
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(response.data);
      }

      setRejectingBooking(null);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Unable to reject booking:", error);
      setRejectionError(
        error.response?.data?.message ||
          "Unable to reject this booking. Please try again.",
      );
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

  const visibleBookings =
    showAllBookings || searchQuery.trim()
      ? filteredBookings
      : filteredBookings.slice(0, 5);

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
      {imagePreviewUrl || profileImageUrl ? (
        <img
          src={imagePreviewUrl || profileImageUrl || undefined}
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
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("role");
              sessionStorage.removeItem("email");
              sessionStorage.removeItem("name");

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
            <NotificationBell />

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
                  {availabilityUpdating && (
                    <p className="mt-1 text-xs text-gray-500">Updating availability...</p>
                  )}
                  {availabilityError && (
                    <p className="mt-1 text-xs text-red-600">{availabilityError}</p>
                  )}
                </div>

                <button
                  onClick={async () => {
                    if (availabilityUpdating) return;

                    const nextAvailability = !isAvailable;
                    setAvailabilityUpdating(true);
                    setAvailabilityError("");

                    try {
                      const response = await api.patch<Worker>(
                        "/workers/me/availability",
                        { available: nextAvailability },
                      );
                      setWorker(response.data);
                      setIsAvailable(response.data.available);
                    } catch (error) {
                      console.error("Unable to update availability:", error);
                      setAvailabilityError(
                        "Could not update availability. Please try again.",
                      );
                    } finally {
                      setAvailabilityUpdating(false);
                    }
                  }}
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
                            onClick={() => void openBookingDetails(booking.id)}
                            className="whitespace-nowrap rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Details
                          </button>
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
                                onClick={() => openRejectBookingModal(booking)}
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
                  Manage the services customers can request from you.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadWorkerServices()}
                  disabled={servicesLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={servicesLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddService((current) => !current)}
                  disabled={servicesLoading || availableServices.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Service
                </button>
              </div>
            </div>

            {servicesError && (
              <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>{servicesError}</span>
                <button
                  type="button"
                  onClick={() => void loadWorkerServices()}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {showAddService && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-gray-900">Add a service to your profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a service from the LocalWorker service catalog.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedServiceId}
                    onChange={(event) => setSelectedServiceId(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Select a service</option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void addWorkerService()}
                    disabled={!selectedServiceId || serviceActionLoading !== null}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {serviceActionLoading !== null ? "Adding..." : "Confirm Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddService(false);
                      setSelectedServiceId("");
                    }}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
                {availableServices.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    You have already added every service in the catalog.
                  </p>
                )}
              </div>
            )}

            {servicesLoading ? (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
                Loading your services...
              </div>
            ) : workerServices.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <BriefcaseBusiness size={34} className="mx-auto text-gray-300" />
                <h3 className="mt-3 font-bold text-gray-900">No services added yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add services to your profile so customers can find and request them.
                </p>
                {availableServices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddService(true)}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Add your first service
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {workerServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Wrench size={24} />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                      {service.name}
                    </h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                      {service.description || "No description available."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-xs text-gray-400">Service ID: {service.id}</span>
                      <button
                        type="button"
                        onClick={() => void removeWorkerService(service.id)}
                        disabled={serviceActionLoading !== null}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {serviceActionLoading === service.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Your assigned services are loaded from the backend service catalog and worker profile.
            </p>
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
                Real feedback submitted by customers after completed bookings.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Average rating</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
                  </span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={17}
                          className={
                            index < Math.round(averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Based on customer feedback</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total reviews</p>
                <p className="mt-3 text-4xl font-extrabold text-gray-900">{reviewCount}</p>
                <p className="mt-1 text-xs text-gray-500">Reviews received from customers</p>
              </div>
            </div>

            {reviewsError && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {reviewsError}
              </div>
            )}

            {reviewsLoading ? (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
                Loading customer reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <Star size={34} className="mx-auto text-gray-300" />
                <h3 className="mt-3 font-bold text-gray-900">No reviews yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Customer reviews will appear here after customers review completed jobs.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                          {(review.customerId ? `C${review.customerId}` : "C").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Customer #{review.customerId}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <ShieldCheck size={20} className="text-emerald-600" />
                    </div>

                    <div className="mt-5 flex items-center gap-1">
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
                      <span className="ml-2 text-xs font-semibold text-gray-500">
                        {review.rating}/5 · Booking #{review.bookingId}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {review.comment || "The customer did not leave a written comment."}
                    </p>
                  </article>
                ))}
              </div>
            )}
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
                  {imagePreviewUrl || profileImageUrl ? (
                    <img
                      src={imagePreviewUrl || profileImageUrl || undefined}
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
                  type="button"
                  onClick={openEditProfile}
                  disabled={!worker || workerLoading}
                  className="mt-6 w-full rounded-xl border border-emerald-600 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit Profile
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleProfileImageSelection}
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={!worker || workerLoading || imageUploading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera size={17} />
                  {imageUploading ? "Uploading picture..." : "Change Profile Picture"}
                </button>

                <p className="mt-2 text-xs text-gray-400">
                  JPG, PNG or WebP · Maximum 5 MB
                </p>

                {imageError && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {imageError}
                  </p>
                )}
                {imageSuccess && (
                  <p role="status" className="mt-3 text-sm text-emerald-700">
                    {imageSuccess}
                  </p>
                )}
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
                      {sessionStorage.getItem("email") ?? "Not available"}
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
                        backend. You can update your professional information using Edit Profile.
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

          {profileSuccess && (
            <div role="status" className="fixed right-4 top-24 z-[90] rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 shadow-lg">
              {profileSuccess}
            </div>
          )}

          {showEditProfile && (
            <div
              className="fixed inset-0 z-[85] flex items-center justify-center bg-gray-950/60 p-4"
              onClick={() => { if (!profileSaving) setShowEditProfile(false); }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-worker-profile-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Your account</p>
                    <h2 id="edit-worker-profile-title" className="mt-1 text-2xl font-extrabold text-gray-900">Edit profile</h2>
                    <p className="mt-1 text-sm text-gray-500">Update the professional information customers see.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    disabled={profileSaving}
                    aria-label="Close edit profile"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {profileError && (
                  <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="worker-profile-name" className="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                    <input
                      id="worker-profile-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={profileForm.name}
                      onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="worker-profile-location" className="mb-2 block text-sm font-semibold text-gray-700">Service location</label>
                      <input
                        id="worker-profile-location"
                        type="text"
                        required
                        maxLength={150}
                        value={profileForm.location}
                        onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="City or area"
                      />
                    </div>
                    <div>
                      <label htmlFor="worker-profile-experience" className="mb-2 block text-sm font-semibold text-gray-700">Experience (years)</label>
                      <input
                        id="worker-profile-experience"
                        type="number"
                        required
                        min={0}
                        max={60}
                        step={1}
                        value={profileForm.experience}
                        onChange={(event) => setProfileForm((current) => ({ ...current, experience: Number(event.target.value) }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="worker-profile-description" className="mb-2 block text-sm font-semibold text-gray-700">Professional description</label>
                    <textarea
                      id="worker-profile-description"
                      required
                      maxLength={1000}
                      rows={5}
                      value={profileForm.description}
                      onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))}
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Describe your skills, experience and the services you provide"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">{profileForm.description.length}/1000</p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      disabled={profileSaving}
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving || !profileForm.name.trim() || !profileForm.location.trim() || !profileForm.description.trim() || profileForm.experience < 0 || profileForm.experience > 60}
                      className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileSaving ? "Saving changes..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {rejectingBooking && (
            <div
              className="fixed inset-0 z-[95] flex items-center justify-center bg-gray-950/60 p-4"
              onClick={closeRejectBookingModal}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-booking-title"
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-600">Booking decision</p>
                    <h2 id="reject-booking-title" className="mt-1 text-2xl font-extrabold text-gray-900">Reject booking</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500">Please explain why you cannot accept this request. The customer will be able to see your reason.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeRejectBookingModal}
                    disabled={bookingActionLoading === rejectingBooking.id}
                    aria-label="Close rejection dialog"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Booking #{rejectingBooking.id}</p>
                  <p className="mt-1 text-sm text-gray-600">{rejectingBooking.serviceName} · {rejectingBooking.customerName || `Customer #${rejectingBooking.customerId}`}</p>
                </div>

                <form onSubmit={submitBookingRejection} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="booking-rejection-reason" className="mb-2 block text-sm font-semibold text-gray-700">Reason for rejection <span className="text-red-600">*</span></label>
                    <textarea
                      id="booking-rejection-reason"
                      required
                      autoFocus
                      rows={5}
                      maxLength={1000}
                      value={rejectionReason}
                      onChange={(event) => {
                        setRejectionReason(event.target.value);
                        if (rejectionError) setRejectionError("");
                      }}
                      placeholder="For example: I am unavailable at the requested time..."
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">{rejectionReason.length}/1000</p>
                  </div>

                  {rejectionError && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{rejectionError}</p>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeRejectBookingModal}
                      disabled={bookingActionLoading === rejectingBooking.id}
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Go back
                    </button>
                    <button
                      type="submit"
                      disabled={bookingActionLoading === rejectingBooking.id || !rejectionReason.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingActionLoading === rejectingBooking.id ? "Rejecting..." : "Confirm rejection"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {(bookingDetailsLoading || bookingDetailsError || selectedBooking) && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/50 p-4" onClick={() => { setSelectedBooking(null); setBookingDetailsError(""); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="worker-booking-details-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Booking information</p><h2 id="worker-booking-details-title" className="mt-1 text-2xl font-extrabold text-gray-900">Booking details</h2></div>
                  <button type="button" onClick={() => { setSelectedBooking(null); setBookingDetailsError(""); }} aria-label="Close details" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20} /></button>
                </div>
                {bookingDetailsLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading booking details...</p> :
                  bookingDetailsError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{bookingDetailsError}</p> :
                  selectedBooking && <>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4"><span className="font-bold text-gray-900">Booking #{selectedBooking.id}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(selectedBooking.status)}`}>{getStatusLabel(selectedBooking.status)}</span></div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-semibold uppercase text-gray-400">Service</p><p className="mt-1 font-semibold text-gray-800">{selectedBooking.serviceName}</p></div>
                      <div><p className="text-xs font-semibold uppercase text-gray-400">Scheduled</p><p className="mt-1 font-semibold text-gray-800">{formatBookingDate(selectedBooking.scheduledAt)} {formatBookingTime(selectedBooking.scheduledAt)}</p></div>
                      <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase text-gray-400">Service address</p><p className="mt-1 text-sm text-gray-700">{selectedBooking.address}</p></div>
                      <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase text-gray-400">Problem description</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{selectedBooking.problemDescription || "No description provided."}</p></div>
                      {selectedBooking.status === "REJECTED" && selectedBooking.rejectionReason && (
                        <div className="sm:col-span-2 rounded-xl border border-red-100 bg-red-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejection reason</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">{selectedBooking.rejectionReason}</p>
                          {selectedBooking.rejectedAt && (
                            <p className="mt-2 text-xs text-red-600">Rejected on {formatBookingDate(selectedBooking.rejectedAt)} at {formatBookingTime(selectedBooking.rejectedAt)}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 rounded-2xl border border-emerald-100 p-5"><h3 className="font-bold text-gray-900">Customer information</h3><p className="mt-3 font-semibold text-gray-800">{selectedBooking.customerName || `Customer #${selectedBooking.customerId}`}</p><p className="mt-1 text-sm text-gray-600">{selectedBooking.customerEmail || "Email not available"}</p><p className="mt-1 text-sm text-gray-600">{selectedBooking.customerPhone || "Phone not available"}</p></div>
                  </>}
              </section>
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            <p>
              © 2026 LocalWorker. Built to connect communities with trusted
              professionals.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Worker profile, bookings, and assigned services are connected to the backend.
              Reviews still use demonstration data.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default WorkerDashboard;