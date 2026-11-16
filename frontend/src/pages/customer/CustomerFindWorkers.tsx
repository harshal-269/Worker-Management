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
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Worker, ServiceOption, WorkerRating } from "../CustomerDashboard";

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
  const { workers, workersLoading, workersError, filteredWorkers, searchTerm, setSearchTerm, location, setLocation, selectedService, setSelectedService, serviceOptions, workerRatings, getProfileImageUrl, initials, openWorkerProfile, openBookingForm, loadWorkersAndServices } = props;

  return (
<div className="space-y-8">
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

</div>
  );
}
