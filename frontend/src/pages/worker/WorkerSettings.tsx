
import {
  Settings,
  ShieldCheck,
  Power,
  Bell,
  UserRound,
  Info,
  ArrowRight,
} from "lucide-react";

interface WorkerSettingsProps {
  isAvailable: boolean;
}

export default function WorkerSettings({ isAvailable }: WorkerSettingsProps) {
  return (
    <section id="settings" className="space-y-7 scroll-mt-28">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Preferences
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Settings
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Manage your worker workspace and review your account preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Settings size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">General preferences</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your workspace settings and account information.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Power size={19} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Booking availability
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Your current availability status for receiving new customer
                  requests.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isAvailable ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {isAvailable ? "Currently available" : "Currently unavailable"}
            </span>
          </div>

          <div className="flex items-start gap-3 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={19} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Profile information</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Keep your name, service location, experience and professional
                description up to date.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/worker/dashboard/profile";
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
              >
                Manage profile <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Bell size={19} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Notifications
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Notification preferences are not configurable in this version
                of the worker dashboard.
              </p>
              <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                Not available yet
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-emerald-700" />
        <div>
          <h3 className="font-bold text-emerald-950">
            Your account and security
          </h3>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            Your worker profile and availability are managed through your
            LocalWorker account. Avoid sharing your login credentials with
            anyone.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5">
        <Info size={20} className="mt-0.5 shrink-0 text-gray-400" />
        <div>
          <h3 className="font-semibold text-gray-800">
            More settings coming later
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Additional preferences such as notification controls and account
            customization can be introduced in future updates.
          </p>
        </div>
      </div>
    </section>
  );
}
