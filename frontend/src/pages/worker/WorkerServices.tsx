
import {
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Trash2,
  Wrench,
  IndianRupee,
  Pencil,
  X,
  Check,
} from "lucide-react";
import type { ServiceItem } from "../WorkerDashboard";

type WorkerServicesProps = {
  workerServices: ServiceItem[];
  availableServices: ServiceItem[];
  servicesLoading: boolean;
  servicesError: string;
  serviceActionLoading: number | null;
  selectedServiceId: string;
  selectedServicePrice: string;
  showAddService: boolean;
  editingServiceId: number | null;
  editingServicePrice: string;
  onRefresh: () => void;
  onToggleAddService: () => void;
  onSetSelectedServiceId: (value: string) => void;
  onSetSelectedServicePrice: (value: string) => void;
  onAddService: () => void;
  onCancelAddService: () => void;
  onStartEditing: (service: ServiceItem) => void;
  onSetEditingServicePrice: (value: string) => void;
  onUpdatePrice: (serviceId: number) => void;
  onCancelEditing: () => void;
  onRemoveService: (serviceId: number) => void;
};

export default function WorkerServices({
  workerServices,
  availableServices,
  servicesLoading,
  servicesError,
  serviceActionLoading,
  selectedServiceId,
  selectedServicePrice,
  showAddService,
  editingServiceId,
  editingServicePrice,
  onRefresh,
  onToggleAddService,
  onSetSelectedServiceId,
  onSetSelectedServicePrice,
  onAddService,
  onCancelAddService,
  onStartEditing,
  onSetEditingServicePrice,
  onUpdatePrice,
  onCancelEditing,
  onRemoveService,
}: WorkerServicesProps) {
  return (
    <section id="services" className="space-y-7 scroll-mt-28">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Your professional offerings
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            My Services
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage the services customers can request from you.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={servicesLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={servicesLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={onToggleAddService}
            disabled={servicesLoading || availableServices.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            Add service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Services offered</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {workerServices.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Available to add</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {availableServices.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Prices configured</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">
            {workerServices.filter((service) => service.price !== null).length}
          </p>
        </div>
      </div>

      {servicesError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{servicesError}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {showAddService && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                Add a service to your profile
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a service from the LocalWorker service catalog and set
                your price.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_auto_auto]">
            <select
              value={selectedServiceId}
              onChange={(event) => onSetSelectedServiceId(event.target.value)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select a service</option>
              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <IndianRupee
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={selectedServicePrice}
                onChange={(event) =>
                  onSetSelectedServicePrice(event.target.value)
                }
                placeholder="Your price"
                aria-label="Service price in rupees"
                className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="button"
              onClick={onAddService}
              disabled={
                !selectedServiceId ||
                !selectedServicePrice ||
                serviceActionLoading !== null
              }
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {serviceActionLoading !== null ? "Adding..." : "Add service"}
            </button>

            <button
              type="button"
              onClick={onCancelAddService}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <X size={16} />
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-100" />
              <div className="mt-5 h-5 w-36 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              <div className="mt-6 h-10 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : workerServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BriefcaseBusiness size={27} />
          </div>
          <h3 className="mt-4 font-bold text-gray-900">
            No services added yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Add services to your profile so customers can find and request
            them.
          </p>
          {availableServices.length > 0 && (
            <button
              type="button"
              onClick={onToggleAddService}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add your first service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workerServices.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Wrench size={23} />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Active
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {service.name}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                {service.description || "No description available."}
              </p>

              <div className="mt-auto border-t border-gray-100 pt-5">
                {editingServiceId === service.id ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-600">
                      Update your price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      value={editingServicePrice}
                      onChange={(event) =>
                        onSetEditingServicePrice(event.target.value)
                      }
                      placeholder="Enter price in ₹"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdatePrice(service.id)}
                        disabled={
                          !editingServicePrice || serviceActionLoading !== null
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check size={15} />
                        {serviceActionLoading === service.id
                          ? "Saving..."
                          : "Save price"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEditing}
                        disabled={serviceActionLoading !== null}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-gray-400">
                      Your service price
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      {service.price === null ? (
                        <p className="text-sm font-bold text-amber-600">
                          Price not set
                        </p>
                      ) : (
                        <p className="text-2xl font-extrabold text-gray-900">
                          ₹
                          {service.price.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => onStartEditing(service)}
                        disabled={serviceActionLoading !== null}
                        aria-label={`Edit price for ${service.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                      >
                        <Pencil size={13} />
                        {service.price === null ? "Set price" : "Edit"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveService(service.id)}
                      disabled={serviceActionLoading !== null}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {serviceActionLoading === service.id
                        ? "Removing..."
                        : "Remove service"}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-gray-400">
        Set a price for every service you offer. Customers will only be able to
        book services with a configured price.
      </p>
    </section>
  );
}
