
import {
  Settings,
  ShieldCheck,
  UserRound,
  Bell,
  LockKeyhole,
  Palette,
  Sparkles,
  Clock3,
} from "lucide-react";

type Props = Record<string, any>;

export default function CustomerSettings(_props: Props) {
  const settingsSections = [
    {
      icon: UserRound,
      title: "Account preferences",
      description:
        "Manage your personal information from the My Profile section.",
      status: "Available",
      available: true,
    },
    {
      icon: Bell,
      title: "Notifications",
      description:
        "Notification preferences and communication controls.",
      status: "Coming soon",
      available: false,
    },
    {
      icon: LockKeyhole,
      title: "Security & privacy",
      description:
        "Additional account security and privacy controls.",
      status: "Coming soon",
      available: false,
    },
    {
      icon: Palette,
      title: "Appearance",
      description:
        "Personalize the look and feel of your workspace.",
      status: "Coming soon",
      available: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
            <Settings size={14} />
            Customer workspace
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Settings
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
            Your workspace preferences and account configuration.
            More personalization options are on the way.
          </p>
        </div>
      </section>

      {/* Settings introduction */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Settings size={21} />
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900">
              Workspace preferences
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Explore the available account options.
            </p>
          </div>
        </div>
      </section>

      {/* Settings options */}
      <section className="grid gap-4 sm:grid-cols-2">
        {settingsSections.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={22} />
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                    item.available
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="mt-5 font-extrabold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {item.description}
              </p>

              {item.available ? (
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={15} />
                  Manage through My Profile
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Clock3 size={15} />
                  Planned for a future update
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Coming soon banner */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-100/70 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <Sparkles size={23} />
          </div>

          <div>
            <h3 className="font-extrabold text-emerald-950">
              More control, coming soon
            </h3>
            <p className="mt-1 text-sm leading-6 text-emerald-800/70">
              We're planning more ways to personalize your LocalWorker
              experience. Additional settings will become available in
              future updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
