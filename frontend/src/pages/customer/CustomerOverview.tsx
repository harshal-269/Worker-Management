
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type CustomerOverviewProps = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  reviewsGiven: number;
  onFindWorkers: () => void;
};

export default function CustomerOverview({
  totalBookings,
  pendingBookings,
  completedBookings,
  reviewsGiven,
  onFindWorkers,
}: CustomerOverviewProps) {
  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      subtitle: "Your service requests",
      icon: CalendarDays,
      iconStyle: "bg-blue-50 text-blue-600",
      accent: "border-blue-100",
    },
    {
      title: "Pending Requests",
      value: pendingBookings,
      subtitle: "Awaiting confirmation",
      icon: Clock,
      iconStyle: "bg-amber-50 text-amber-600",
      accent: "border-amber-100",
    },
    {
      title: "Completed",
      value: completedBookings,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
      accent: "border-emerald-100",
    },
    {
      title: "Reviews Given",
      value: reviewsGiven,
      subtitle: "Your valuable feedback",
      icon: Star,
      iconStyle: "bg-purple-50 text-purple-600",
      accent: "border-purple-100",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome banner */}
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#103d30] p-7 text-white shadow-xl shadow-emerald-950/10 sm:p-10 lg:p-11">
        {/* Background decoration */}
        <div className="absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-emerald-100">
              <Sparkles size={13} />
              Your local service companion
            </div>

            <h2 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[44px]">
              Find the right help
              <br className="hidden sm:block" /> for your home.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-100/80 sm:text-base">
              Your home deserves the best care. Discover trusted local
              professionals, explore their profiles, and book the services
              you need.
            </p>

            <button
              type="button"
              onClick={onFindWorkers}
              className="group mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-emerald-900 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Find a professional
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Decorative right panel */}
          <div className="hidden w-full max-w-[245px] shrink-0 md:block">
            <div className="relative rounded-[26px] border border-white/15 bg-white/[0.08] p-6 backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-emerald-100">
                <BriefcaseBusiness size={30} />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                LocalWorker
              </p>

              <p className="mt-2 text-2xl font-extrabold leading-tight">
                Your home.
                <br />
                Our professionals.
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                  <CheckCircle2 size={15} />
                </span>
                <span className="text-xs font-medium text-emerald-100">
                  Service made simpler
                </span>
              </div>

              <Sparkles
                size={22}
                className="absolute -right-3 -top-3 text-emerald-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics heading */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
              Your activity
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Booking overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your activity on LocalWorker.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
            <TrendingUp size={14} />
            Your activity at a glance
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className={`group rounded-2xl border ${card.accent} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 sm:p-6`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconStyle} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon size={23} strokeWidth={2} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs font-medium text-slate-400">
                    {card.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
