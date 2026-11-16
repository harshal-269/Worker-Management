import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import {
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  Star,
  UserRound,
  Settings,
  X,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Camera,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout, { type DashboardNavItem } from "../components/dashboard/DashboardLayout";
import WorkerBills from "./worker/WorkerBills";
import WorkerReviews from "./worker/WorkerReviews";
import WorkerSettings from "./worker/WorkerSettings";
import WorkerOverview from "./worker/WorkerOverview";
import WorkerBookings from "./worker/WorkerBookings";
import WorkerServices from "./worker/WorkerServices";

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface Worker {
  id: number;
  name: string;
  location: string;
  experience: number;
  description: string;
  available: boolean;
  profileImage: string | null;
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number | null;
  active: boolean;
}

interface WorkerServiceOffering {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceDescription: string | null;
  price: number | null;
  active: boolean;
}

export interface Booking {
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

export interface Review {
  id: number;
  bookingId: number;
  customerId: number;
  workerId: number;
  workerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function WorkerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeSection = location.pathname.split("/").filter(Boolean).pop() || "overview";
  const validSections = ["overview", "bookings", "bills", "services", "reviews", "profile", "settings"];
  const activeSection = validSections.includes(routeSection) ? routeSection : "overview";

  useEffect(() => {
    if (location.pathname === "/worker/dashboard" || location.pathname === "/worker/dashboard/") {
      navigate("/worker/dashboard/overview", { replace: true });
    }
  }, [location.pathname, navigate]);

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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [bookingDetailsError, setBookingDetailsError] = useState("");

  const [workerServices, setWorkerServices] = useState<ServiceItem[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [serviceActionLoading, setServiceActionLoading] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedServicePrice, setSelectedServicePrice] = useState("");
  const [showAddService, setShowAddService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingServicePrice, setEditingServicePrice] = useState("");

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
      if (showLoading) setServicesLoading(true);
      setServicesError("");

      const [offeringsResponse, catalogResponse] = await Promise.all([
        api.get<WorkerServiceOffering[]>("/workers/me/offerings"),
        api.get<ServiceItem[]>("/services"),
      ]);

      const mappedOfferings: ServiceItem[] = offeringsResponse.data.map((offering) => ({
        id: offering.serviceId,
        name: offering.serviceName,
        description: offering.serviceDescription ?? "",
        price: offering.price,
        active: offering.active,
      }));

      setWorkerServices(mappedOfferings);
      setServiceCatalog(catalogResponse.data);
    } catch (error) {
      console.error("Unable to load worker service offerings:", error);
      setServicesError("Unable to load your services and prices. Please try again.");
    } finally {
      if (showLoading) setServicesLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkerServices();
  }, []);

  const addWorkerService = async () => {
    const serviceId = Number(selectedServiceId);
    const price = Number(selectedServicePrice);

    if (!serviceId || !Number.isFinite(price) || price < 1 || serviceActionLoading !== null) {
      setServicesError("Select a service and enter a valid price of at least ₹1.");
      return;
    }

    try {
      setServiceActionLoading(serviceId);
      setServicesError("");

      await api.post<WorkerServiceOffering>("/workers/me/offerings", {
        serviceId,
        price,
      });

      setSelectedServiceId("");
      setSelectedServicePrice("");
      setShowAddService(false);
      await loadWorkerServices(false);
    } catch (error) {
      console.error("Unable to add worker service offering:", error);
      setServicesError(
        "Unable to add this service. It may already exist, or the price may be invalid.",
      );
    } finally {
      setServiceActionLoading(null);
    }
  };

  const startEditingServicePrice = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setEditingServicePrice(service.price === null ? "" : String(service.price));
    setServicesError("");
  };

  const updateWorkerServicePrice = async (serviceId: number) => {
    const price = Number(editingServicePrice);

    if (!Number.isFinite(price) || price < 1 || serviceActionLoading !== null) {
      setServicesError("Enter a valid price of at least ₹1.");
      return;
    }

    try {
      setServiceActionLoading(serviceId);
      setServicesError("");

      await api.put<WorkerServiceOffering>(`/workers/me/offerings/${serviceId}`, {
        serviceId,
        price,
      });

      setEditingServiceId(null);
      setEditingServicePrice("");
      await loadWorkerServices(false);
    } catch (error) {
      console.error("Unable to update service price:", error);
      setServicesError("Unable to update this price. Please try again.");
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

      await api.delete(`/workers/me/offerings/${serviceId}`);
      await loadWorkerServices(false);
    } catch (error) {
      console.error("Unable to remove worker service offering:", error);
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

  const handleToggleAvailability = async () => {
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
    navigate(`/worker/dashboard/${sectionId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const dashboardNavItems: DashboardNavItem[] = [
    { label: "Overview", icon: LayoutDashboard, path: "overview" },
    { label: "My Bookings", icon: ClipboardList, path: "bookings", badge: pendingBookings },
    { label: "My Bills", icon: ReceiptText, path: "bills" },
    { label: "My Services", icon: BriefcaseBusiness, path: "services" },
    { label: "Reviews", icon: Star, path: "reviews" },
    { label: "My Profile", icon: UserRound, path: "profile" },
    { label: "Settings", icon: Settings, path: "settings" },
  ];

  const dashboardTitles: Record<string, string> = {
    overview: "Overview",
    bookings: "My Bookings",
    bills: "My Bills",
    services: "My Services",
    reviews: "Reviews",
    profile: "My Profile",
    settings: "Settings",
  };

  return (
    <DashboardLayout
      title={dashboardTitles[activeSection] ?? "Overview"}
      description="Manage your services, bookings and customer requests."
      navItems={dashboardNavItems}
      basePath="/worker/dashboard"
      userName={workerLoading ? "Loading profile..." : workerName}
      roleLabel="Service Professional"
      userAvatar={<ProfileAvatar />}
    >
      <div className="space-y-8">
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

{activeSection === "overview" && (
          <WorkerOverview
            worker={worker}
            workerName={workerName}
            workerLoading={workerLoading}
            isAvailable={isAvailable}
            availabilityUpdating={availabilityUpdating}
            availabilityError={availabilityError}
            bookings={bookings}
            pendingBookings={pendingBookings}
            completedBookings={completedBookings}
            onToggleAvailability={handleToggleAvailability}
            onNavigate={navigateToSection}
            formatBookingDate={formatBookingDate}
            formatBookingTime={formatBookingTime}
            getCustomerLabel={getCustomerLabel}
            getStatusStyle={getStatusStyle}
            getStatusLabel={getStatusLabel}
          />
        )}

{activeSection === "bookings" && (
          <WorkerBookings
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            bookingsError={bookingsError}
            bookingActionLoading={bookingActionLoading}
            onOpenBookingDetails={openBookingDetails}
            onUpdateBookingStatus={updateBookingStatus}
            onOpenRejectBookingModal={openRejectBookingModal}
            formatBookingDate={formatBookingDate}
            formatBookingTime={formatBookingTime}
            getCustomerLabel={getCustomerLabel}
            getStatusStyle={getStatusStyle}
            getStatusLabel={getStatusLabel}
          />
        )}

{activeSection === "bills" && <WorkerBills bookings={bookings} />}

{activeSection === "services" && (
          <WorkerServices
            workerServices={workerServices}
            availableServices={availableServices}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            serviceActionLoading={serviceActionLoading}
            selectedServiceId={selectedServiceId}
            selectedServicePrice={selectedServicePrice}
            showAddService={showAddService}
            editingServiceId={editingServiceId}
            editingServicePrice={editingServicePrice}
            onRefresh={() => void loadWorkerServices()}
            onToggleAddService={() => setShowAddService((current) => !current)}
            onSetSelectedServiceId={setSelectedServiceId}
            onSetSelectedServicePrice={setSelectedServicePrice}
            onAddService={() => void addWorkerService()}
            onCancelAddService={() => {
              setShowAddService(false);
              setSelectedServiceId("");
              setSelectedServicePrice("");
            }}
            onStartEditing={startEditingServicePrice}
            onSetEditingServicePrice={setEditingServicePrice}
            onUpdatePrice={(serviceId) => void updateWorkerServicePrice(serviceId)}
            onCancelEditing={() => {
              setEditingServiceId(null);
              setEditingServicePrice("");
            }}
            onRemoveService={(serviceId) => void removeWorkerService(serviceId)}
          />
        )}

<WorkerReviews
            reviews={reviews}
            reviewCount={reviewCount}
            averageRating={averageRating}
            reviewsError={reviewsError}
            reviewsLoading={reviewsLoading}
          />

          {activeSection === "profile" && (
          <>
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

          </>
          )}

{activeSection === "settings" && (
            <WorkerSettings isAvailable={isAvailable} />
          )}

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
    </DashboardLayout>
  );
}

export default WorkerDashboard;