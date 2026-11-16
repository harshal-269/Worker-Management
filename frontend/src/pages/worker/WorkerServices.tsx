import { BriefcaseBusiness, Plus, RefreshCw, Trash2, Wrench } from "lucide-react";
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

/** Service management UI. API and business logic remain in WorkerDashboard. */
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
    <section id="services" className="scroll-mt-28">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">WHAT YOU OFFER</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">My Services</h2>
          <p className="mt-1 text-sm text-gray-500">
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
            <RefreshCw size={16} className={servicesLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onToggleAddService}
            disabled={servicesLoading || availableServices.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} /> Add Service
          </button>
        </div>
      </div>

      {servicesError && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{servicesError}</span>
          <button type="button" onClick={onRefresh} className="font-semibold underline">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <select
              value={selectedServiceId}
              onChange={(event) => onSetSelectedServiceId(event.target.value)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select a service</option>
              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={selectedServicePrice}
              onChange={(event) => onSetSelectedServicePrice(event.target.value)}
              placeholder="Price in ₹"
              aria-label="Service price in rupees"
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={onAddService}
              disabled={!selectedServiceId || !selectedServicePrice || serviceActionLoading !== null}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {serviceActionLoading !== null ? "Adding..." : "Confirm Add"}
            </button>
            <button
              type="button"
              onClick={onCancelAddService}
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
              onClick={onToggleAddService}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Add your first service
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workerServices.map((service) => (
            <div key={service.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Wrench size={24} />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">{service.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                {service.description || "No description available."}
              </p>

              <div className="mt-5 border-t border-gray-100 pt-4">
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
                      onChange={(event) => onSetEditingServicePrice(event.target.value)}
                      placeholder="Enter price in ₹"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdatePrice(service.id)}
                        disabled={!editingServicePrice || serviceActionLoading !== null}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {serviceActionLoading === service.id ? "Saving..." : "Save price"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEditing}
                        disabled={serviceActionLoading !== null}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Your service price</p>
                        {service.price === null ? (
                          <p className="mt-1 text-sm font-semibold text-amber-600">Price not set</p>
                        ) : (
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            ₹{service.price.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartEditing(service)}
                        disabled={serviceActionLoading !== null}
                        className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                      >
                        {service.price === null ? "Set price" : "Edit price"}
                      </button>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemoveService(service.id)}
                        disabled={serviceActionLoading !== null}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {serviceActionLoading === service.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Set a price for every service you offer. Customers will only be able to book services with a configured price.
      </p>
    </section>
  );
}
