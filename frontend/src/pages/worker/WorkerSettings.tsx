import { Settings } from "lucide-react";

interface WorkerSettingsProps {
  isAvailable: boolean;
}

/** Settings page for worker availability preferences. */
export default function WorkerSettings({ isAvailable }: WorkerSettingsProps) {
  return (
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
  );
}
