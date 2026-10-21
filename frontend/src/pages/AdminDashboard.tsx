import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ClipboardList,
  Search,
  Menu,
  X,
  LogOut,
  Bell,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  UserRound,
  Ban,
  Check,
  XCircle,
  Star,
} from "lucide-react";

type WorkerStatus = "Approved" | "Pending" | "Suspended";

interface Worker {
  id: number;
  name: string;
  email: string;
  service: string;
  location: string;
  rating: number;
  status: WorkerStatus;
}

interface Booking {
  id: number;
  customer: string;
  worker: string;
  service: string;
  date: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

const initialWorkers: Worker[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    service: "Plumbing",
    location: "Sangamner",
    rating: 4.8,
    status: "Approved",
  },
  {
    id: 2,
    name: "Amit Patil",
    email: "amit@example.com",
    service: "Electrical Repairs",
    location: "Sangamner",
    rating: 4.7,
    status: "Pending",
  },
  {
    id: 3,
    name: "Sneha Deshmukh",
    email: "sneha@example.com",
    service: "Home Cleaning",
    location: "Nashik",
    rating: 4.9,
    status: "Approved",
  },
  {
    id: 4,
    name: "Vijay Jadhav",
    email: "vijay@example.com",
    service: "Carpentry",
    location: "Pune",
    rating: 4.5,
    status: "Suspended",
  },
];

const initialBookings: Booking[] = [
  {
    id: 1001,
    customer: "Priya Shinde",
    worker: "Rahul Sharma",
    service: "Tap Repair",
    date: "18 Oct 2026",
    amount: 500,
    status: "Confirmed",
  },
  {
    id: 1002,
    customer: "Amit Patil",
    worker: "Sneha Deshmukh",
    service: "Home Cleaning",
    date: "18 Oct 2026",
    amount: 900,
    status: "Pending",
  },
  {
    id: 1003,
    customer: "Neha More",
    worker: "Rahul Sharma",
    service: "Pipe Installation",
    date: "17 Oct 2026",
    amount: 1200,
    status: "Completed",
  },
  {
    id: 1004,
    customer: "Rohit Pawar",
    worker: "Vijay Jadhav",
    service: "Carpentry",
    date: "16 Oct 2026",
    amount: 700,
    status: "Cancelled",
  },
];

const customers = [
  {
    id: 1,
    name: "Priya Shinde",
    email: "priya@example.com",
    location: "Sangamner",
    bookings: 4,
  },
  {
    id: 2,
    name: "Neha More",
    email: "neha@example.com",
    location: "Nashik",
    bookings: 7,
  },
  {
    id: 3,
    name: "Rohit Pawar",
    email: "rohit@example.com",
    location: "Pune",
    bookings: 2,
  },
  {
    id: 4,
    name: "Amit Patil",
    email: "amit@example.com",
    location: "Sangamner",
    bookings: 3,
  },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "Customers", icon: Users, id: "customers" },
  { label: "Workers", icon: BriefcaseBusiness, id: "workers" },
  { label: "Bookings", icon: ClipboardList, id: "bookings" },
];

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workerList, setWorkerList] = useState(initialWorkers);
  const [bookingList, setBookingList] = useState(initialBookings);
  const [workerSearch, setWorkerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  const navigateToSection = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);

    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const updateWorkerStatus = (
    workerId: number,
    status: WorkerStatus,
  ) => {
    setWorkerList((current) =>
      current.map((worker) =>
        worker.id === workerId ? { ...worker, status } : worker,
      ),
    );
  };

  const updateBookingStatus = (
    bookingId: number,
    status: Booking["status"],
  ) => {
    setBookingList((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking,
      ),
    );
  };

  const approvedWorkers = workerList.filter(
    (worker) => worker.status === "Approved",
  ).length;

  const pendingWorkers = workerList.filter(
    (worker) => worker.status === "Pending",
  ).length;

  const completedBookings = bookingList.filter(
    (booking) => booking.status === "Completed",
  ).length;

  const totalRevenue = bookingList
    .filter((booking) => booking.status === "Completed")
    .reduce((total, booking) => total + booking.amount, 0);

  const filteredWorkers = workerList.filter((worker) => {
    const query = workerSearch.toLowerCase();

    return (
      worker.name.toLowerCase().includes(query) ||
      worker.email.toLowerCase().includes(query) ||
      worker.service.toLowerCase().includes(query) ||
      worker.location.toLowerCase().includes(query)
    );
  });

  const filteredCustomers = customers.filter((customer) => {
    const query = customerSearch.toLowerCase();

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.location.toLowerCase().includes(query)
    );
  });

  const filteredBookings = bookingList.filter((booking) => {
    const query = bookingSearch.toLowerCase();

    return (
      booking.customer.toLowerCase().includes(query) ||
      booking.worker.toLowerCase().includes(query) ||
      booking.service.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  const statusStyle = (status: string) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return "bg-emerald-50 text-emerald-700";
      case "Pending":
        return "bg-amber-50 text-amber-700";
      case "Suspended":
      case "Cancelled":
        return "bg-red-50 text-red-700";
      case "Confirmed":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Mobile overlay */}
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
              <BriefcaseBusiness size={22} />
            </div>

            <span className="text-xl font-bold text-gray-900">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
              <ShieldCheck size={23} />
            </div>

            <div>
              <p className="font-semibold text-gray-900">Administrator</p>
              <p className="text-xs text-emerald-700">Platform Management</p>
            </div>
          </div>
        </div>

        <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          ADMIN WORKSPACE
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigateToSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-64">
        {/* Topbar */}
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
              <p className="text-sm text-gray-500">Administration</p>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
            >
              <Bell size={19} />
              {pendingWorkers > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              AD
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
          {/* Overview */}
          <section id="overview" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                PLATFORM OVERVIEW
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Welcome, Administrator 👋
              </h2>

              <p className="mt-2 text-gray-500">
                Monitor the LocalWorker platform and manage its activity.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Total Customers",
                  value: customers.length,
                  detail: "Sample customer records",
                  icon: Users,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Approved Workers",
                  value: approvedWorkers,
                  detail: `${pendingWorkers} awaiting approval`,
                  icon: BriefcaseBusiness,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  title: "Total Bookings",
                  value: bookingList.length,
                  detail: `${completedBookings} completed`,
                  icon: ClipboardList,
                  color: "bg-purple-50 text-purple-600",
                },
                {
                  title: "Completed Job Value",
                  value: `₹${totalRevenue.toLocaleString("en-IN")}`,
                  detail: "From demo completed bookings",
                  icon: IndianRupee,
                  color: "bg-amber-50 text-amber-600",
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
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

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Worker Approvals
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Review workers awaiting approval.
                    </p>
                  </div>

                  <button
                    onClick={() => navigateToSection("workers")}
                    className="whitespace-nowrap text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {workerList
                    .filter((worker) => worker.status === "Pending")
                    .map((worker) => (
                      <div
                        key={worker.id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                            {worker.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {worker.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {worker.service}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {worker.location}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            updateWorkerStatus(worker.id, "Approved")
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Check size={16} />
                          Approve Worker
                        </button>
                      </div>
                    ))}

                  {pendingWorkers === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">
                      No workers are awaiting approval.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-700 p-6 text-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <TrendingUp size={25} />
                </div>

                <p className="mt-6 text-sm text-emerald-100">
                  Platform status
                </p>

                <h3 className="mt-2 text-2xl font-bold">All systems ready</h3>

                <p className="mt-3 text-sm leading-6 text-emerald-100">
                  This dashboard is using sample data. Live platform metrics
                  will be connected to the Spring Boot backend later.
                </p>

                <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-5 text-sm">
                  <CheckCircle2 size={18} />
                  <span>Admin interface loaded</span>
                </div>
              </div>
            </div>
          </section>

          {/* Customers */}
          <section id="customers" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                CUSTOMER MANAGEMENT
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Customers
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search and review customer accounts.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="relative max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={customerSearch}
                    onChange={(event) =>
                      setCustomerSearch(event.target.value)
                    }
                    placeholder="Search customers..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Customer",
                        "Location",
                        "Total Bookings",
                        "Account",
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
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                              {customer.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {customer.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} />
                            {customer.location}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                          {customer.bookings}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-10 text-center text-sm text-gray-500"
                        >
                          No customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Workers */}
          <section id="workers" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                WORKER MANAGEMENT
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Service Professionals
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review worker profiles and manage approval status.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="relative max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={workerSearch}
                    onChange={(event) => setWorkerSearch(event.target.value)}
                    placeholder="Search workers..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Worker",
                        "Service",
                        "Location",
                        "Rating",
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
                    {filteredWorkers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                              {worker.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {worker.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {worker.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-gray-700">
                          {worker.service}
                        </td>

                        <td className="px-5 py-5 text-sm text-gray-600">
                          {worker.location}
                        </td>

                        <td className="px-5 py-5">
                          <span className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                            <Star
                              size={15}
                              className="fill-amber-400 text-amber-400"
                            />
                            {worker.rating}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
                              worker.status,
                            )}`}
                          >
                            {worker.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          {worker.status === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateWorkerStatus(worker.id, "Approved")
                                }
                                title="Approve worker"
                                aria-label={`Approve ${worker.name}`}
                                className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                              >
                                <Check size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  updateWorkerStatus(worker.id, "Suspended")
                                }
                                title="Reject worker"
                                aria-label={`Reject ${worker.name}`}
                                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}

                          {worker.status === "Approved" && (
                            <button
                              onClick={() =>
                                updateWorkerStatus(worker.id, "Suspended")
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                            >
                              <Ban size={14} />
                              Suspend
                            </button>
                          )}

                          {worker.status === "Suspended" && (
                            <button
                              onClick={() =>
                                updateWorkerStatus(worker.id, "Approved")
                              }
                              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredWorkers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-sm text-gray-500"
                        >
                          No workers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Worker approval and suspension currently update local demo data
              only. Real administrative permissions must be enforced by the
              backend.
            </p>
          </section>

          {/* Bookings */}
          <section id="bookings" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                BOOKING MANAGEMENT
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                All Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Monitor service requests across the platform.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="relative max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={bookingSearch}
                    onChange={(event) => setBookingSearch(event.target.value)}
                    placeholder="Search bookings..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Booking ID",
                        "Customer",
                        "Worker",
                        "Service",
                        "Date",
                        "Amount",
                        "Status",
                        "Action",
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
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-5 py-5 text-sm font-semibold text-gray-800">
                          #{booking.id}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-700">
                          {booking.customer}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-700">
                          {booking.worker}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-700">
                          {booking.service}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-600">
                          {booking.date}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-gray-900">
                          ₹{booking.amount}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          {booking.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.id,
                                    "Confirmed",
                                  )
                                }
                                title="Confirm booking"
                                aria-label={`Confirm booking ${booking.id}`}
                                className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.id,
                                    "Cancelled",
                                  )
                                }
                                title="Cancel booking"
                                aria-label={`Cancel booking ${booking.id}`}
                                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredBookings.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-10 text-center text-sm text-gray-500"
                        >
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Booking management currently uses sample data and local state.
              Live booking updates will be integrated with the backend later.
            </p>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            © 2026 LocalWorker. Administration Dashboard.
            <p className="mt-2 text-xs text-gray-400">
              All displayed records are demonstration data.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;