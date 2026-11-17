
import {
  ArrowRight,
  BriefcaseBusiness,
  Hammer,
  MapPin,
  Paintbrush,
  RefreshCw,
  Search,
  Snowflake,
  Sparkles,
  Star,
  Wrench,
  Zap,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type {
  Worker,
  ServiceOption,
  WorkerRating,
} from "../CustomerDashboard";

type Props = {
  workers: Worker[];
  workersLoading: boolean;
  workersError: string;
  filteredWorkers: Worker[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  selectedService: string;
  setSelectedService: Dispatch<SetStateAction<string>>;
  serviceOptions: ServiceOption[];
  workerRatings: Record<number, WorkerRating>;
  getProfileImageUrl: (path: string | null) => string | null;
  initials: (name: string) => string;
  openWorkerProfile: (worker: Worker) => Promise<void>;
  openBookingForm: (worker: Worker) => void;
  loadWorkersAndServices: () => Promise<void>;
};

export default function CustomerFindWorkers(props: Props) {
  const {
    workers,
    workersLoading,
    workersError,
    filteredWorkers,
    searchTerm,
    setSearchTerm,
    location,
    setLocation,
    selectedService,
    setSelectedService,
    serviceOptions,
    workerRatings,
    getProfileImageUrl,
    initials,
    openWorkerProfile,
    openBookingForm,
    loadWorkersAndServices,
  } = props;

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setSelectedService("All Services");
  };

  const getServiceIcon = (name: string) => {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes("electric")) return Zap;
    if (normalizedName.includes("plumb")) return Wrench;
    if (normalizedName.includes("paint")) return Paintbrush;
    if (normalizedName.includes("clean")) return Sparkles;
    if (
      normalizedName.includes("ac") ||
      normalizedName.includes("air condition")
    ) return Snowflake;
    if (normalizedName.includes("carpent")) return Hammer;

    return BriefcaseBusiness;
  };

  const getServiceWorkerCount = (serviceId: number) =>
    workers.filter((worker) =>
      (worker.services ?? []).some(
        (assignedService) => assignedService.id === serviceId
      )
    ).length;

  return (
    <div className="space-y-9">
      {/* Page introduction */}
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#103d30] p-7 text-white shadow-xl shadow-emerald-950/10 sm:p-9">
        <div className="absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-emerald-100">
              <Sparkles size={13} />
              Discover local talent
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find the right professional.
              <br className="hidden sm:block" />
              Get things done.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
              Explore local professionals, compare their experience and
              reviews, and find the right person for your next service.
            </p>
          </div>

          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border border-white/15 bg-white/10 text-emerald-100 sm:flex">
            <Users size={38} />
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section
        id="find-workers"
        className="scroll-mt-24 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <SlidersHorizontal size={17} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">
                Search and filters
              </span>
            </div>

            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Find your professional
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by name, location or service category.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            Clear all filters
          </button>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_220px]">
          <label className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
            <Search size={19} className="shrink-0 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Worker name or description"
              aria-label="Search worker or description"
              className="min-w-0 w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
            <MapPin size={19} className="shrink-0 text-slate-400" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter your location"
              aria-label="Filter workers by location"
              className="min-w-0 w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value)}
            aria-label="Filter by service"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          >
            <option>All Services</option>
            {serviceOptions.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Service categories */}
      <section>
        <div className="mb-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
            Explore categories
          </p>

          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Browse services
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a service to find professionals who provide it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {serviceOptions.map((service) => {
            const Icon = getServiceIcon(service.name);
            const serviceCount = getServiceWorkerCount(service.id);
            const isSelected = selectedService === service.name;

            return (
              <button
                type="button"
                key={service.id}
                disabled={serviceCount === 0}
                onClick={() =>
                  setSelectedService(
                    isSelected ? "All Services" : service.name
                  )
                }
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 sm:p-5 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                    : "border-slate-200 bg-white hover:border-emerald-200"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                  }`}
                >
                  <Icon size={22} />
                </div>

                <p className="mt-4 line-clamp-1 text-sm font-extrabold text-slate-900">
                  {service.name}
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {serviceCount} professionals
                </p>

                {isSelected && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Professionals */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
              Meet the experts
            </p>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Local professionals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Explore worker profiles and choose the right professional.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              {filteredWorkers.length} found
            </span>

            <button
              type="button"
              onClick={() => void loadWorkersAndServices()}
              disabled={workersLoading}
              aria-label="Refresh workers"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={workersLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {workersError && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {workersError}
          </div>
        )}

        {workersLoading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-7 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-3 w-2/3 rounded bg-slate-100" />
                <div className="mt-8 h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredWorkers.map((worker) => {
              const imageUrl = getProfileImageUrl(worker.profileImage);
              const rating = workerRatings[worker.id]?.averageRating ?? 0;
              const reviewCount =
                workerRatings[worker.id]?.reviewCount ?? 0;

              return (
                <article
                  key={worker.id}
                  className="group overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  {/* Worker identity */}
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={worker.name}
                          className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-extrabold text-emerald-700">
                          {initials(worker.name || "Worker")}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 pt-1">
                        <h3 className="truncate text-base font-extrabold text-slate-900">
                          {worker.name || `Worker #${worker.id}`}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {worker.description ||
                            "Local service professional"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${
                          worker.available
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            worker.available
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {worker.available ? "Available" : "Unavailable"}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        ID #{worker.id}
                      </span>
                    </div>
                  </div>

                  {/* Worker details */}
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
                        <MapPin
                          size={16}
                          className="shrink-0 text-emerald-600"
                        />
                        <span className="truncate">
                          {worker.location || "Location not provided"}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Star
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-sm font-extrabold text-slate-800">
                          {rating > 0 ? rating.toFixed(1) : "New"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
                      <BriefcaseBusiness
                        size={17}
                        className="shrink-0 text-emerald-600"
                      />
                      <p className="text-xs text-slate-600">
                        <span className="font-extrabold text-slate-900">
                          {worker.experience} years
                        </span>{" "}
                        of professional experience
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                        Services offered
                      </p>

                      {(worker.services ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {worker.services.map((service) => (
                            <span
                              key={service.id}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700"
                            >
                              {service.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No services added yet
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => void openWorkerProfile(worker)}
                        className="rounded-xl border border-emerald-200 px-3 py-3 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-50 sm:text-sm"
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        disabled={
                          !worker.available ||
                          (worker.services ?? []).length === 0
                        }
                        onClick={() => openBookingForm(worker)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:text-sm"
                      >
                        Book Now
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Empty state */}
            {filteredWorkers.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center lg:col-span-2 xl:col-span-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Search size={29} />
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  No professionals found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {workers.length === 0
                    ? "No worker profiles have been registered yet."
                    : "We couldn't find any professionals matching your filters. Try another name, service or location."}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Clear filters
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
