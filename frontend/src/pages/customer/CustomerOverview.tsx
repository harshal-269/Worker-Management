import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

type CustomerOverviewProps = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  reviewsGiven: number;
  onFindWorkers: () => void;
};

/** Customer landing page with service discovery call-to-action and account statistics. */
export default function CustomerOverview({
  totalBookings,
  pendingBookings,
  completedBookings,
  reviewsGiven,
  onFindWorkers,
}: CustomerOverviewProps) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-700 p-7 text-white sm:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/40 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-emerald-200">YOUR LOCAL SERVICE COMPANION</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Find the right help
              <br className="hidden sm:block" /> for your home.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-emerald-100">
              Explore local professionals, compare their profiles, and request the services you need.
            </p>
            <button
              type="button"
              onClick={onFindWorkers}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              Find a worker <ArrowRight size={18} />
            </button>
          </div>
          <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-7 md:block">
            <BriefcaseBusiness size={58} />
            <p className="mt-4 text-sm text-emerald-100">Your neighbourhood</p>
            <p className="mt-1 text-xl font-extrabold">Your trusted experts</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Bookings",
            value: String(totalBookings),
            subtitle: "Your service requests",
            icon: CalendarDays,
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Pending Requests",
            value: String(pendingBookings),
            subtitle: "Awaiting confirmation",
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            title: "Completed",
            value: String(completedBookings),
            subtitle: "Successfully completed",
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Reviews Given",
            value: String(reviewsGiven),
            subtitle: "Your feedback",
            icon: Star,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-3 text-3xl font-extrabold">{card.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">{card.subtitle}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
