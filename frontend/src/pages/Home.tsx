import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Snowflake,
  Sparkles,
  Menu,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

const services = [
  { name: "Plumbing", icon: Wrench, color: "bg-blue-100 text-blue-600" },
  { name: "Electrical", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { name: "Painting", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { name: "Carpentry", icon: Hammer, color: "bg-orange-100 text-orange-600" },
  { name: "AC Repair", icon: Snowflake, color: "bg-cyan-100 text-cyan-600" },
  { name: "Cleaning", icon: Sparkles, color: "bg-emerald-100 text-emerald-600" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description: "Find professionals for your home service needs.",
  },
  {
    icon: Clock,
    title: "Convenient Booking",
    description: "Request services when it works best for you.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Use customer feedback to choose a professional.",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
              L
            </div>

            <span className="text-2xl font-extrabold tracking-tight">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              Services
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              How it works
            </a>
            <a href="#why-us" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              Why LocalWorker?
            </a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Get Started
            </a>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 hover:bg-slate-100 sm:hidden"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28 lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                <Sparkles size={16} />
                Your neighbourhood service platform
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Skilled help for your home,
                <span className="mt-2 block text-emerald-600">
                  right around the corner.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Discover local professionals, explore services, and request
                the help you need—all in one place.
              </p>

              {/* Search */}
              <div className="mt-9 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <Search className="shrink-0 text-emerald-600" size={21} />
                    <div className="min-w-0 flex-1">
                      <label htmlFor="service" className="block text-xs font-semibold text-slate-500">
                        WHAT DO YOU NEED?
                      </label>
                      <input
                        id="service"
                        type="text"
                        placeholder="e.g. Plumber"
                        className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl px-3 py-2 sm:border-l sm:border-slate-100">
                    <MapPin className="shrink-0 text-emerald-600" size={21} />
                    <div className="min-w-0 flex-1">
                      <label htmlFor="location" className="block text-xs font-semibold text-slate-500">
                        YOUR LOCATION
                      </label>
                      <input
                        id="location"
                        type="text"
                        placeholder="Enter your city"
                        className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Search <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-emerald-600" />
                  Trusted local professionals
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={17} className="text-emerald-600" />
                  Convenient service requests
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full bg-emerald-200/50 blur-3xl" />
              <div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-full bg-teal-200/50 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-emerald-900/10 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Find the right professional
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Local experts, made accessible.
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <Wrench size={26} />
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {[
                    { name: "Home Repairs", detail: "Plumbing & electrical", icon: Wrench, color: "bg-blue-100 text-blue-600" },
                    { name: "Home Improvement", detail: "Painting & carpentry", icon: Hammer, color: "bg-orange-100 text-orange-600" },
                    { name: "Home Maintenance", detail: "Cleaning & AC repair", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                      >
                        <div className={`rounded-xl p-3 ${item.color}`}>
                          <Icon size={23} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                        </div>

                        <ArrowRight size={18} className="text-slate-400" />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl bg-emerald-600 p-5 text-white">
                  <p className="text-sm text-emerald-100">
                    Looking for work?
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold">
                      Join as a professional
                    </p>
                    <BriefcaseBusiness size={25} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-emerald-600">OUR SERVICES</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                What can we help you with?
              </h2>
              <p className="mt-3 text-slate-500">
                Explore services offered by professionals in your area.
              </p>
            </div>

            <a
              href="#services"
              className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Explore services <ArrowRight size={18} />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <button
                  type="button"
                  key={service.name}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                >
                  <div className={`inline-flex rounded-2xl p-4 ${service.color}`}>
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-4 font-bold">{service.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Find a professional</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-emerald-600">SIMPLE PROCESS</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Get the help you need in three steps
              </h2>
              <p className="mt-4 text-slate-500">
                Finding a local professional doesn't have to be complicated.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { number: "01", title: "Find a service", description: "Explore service categories and search for professionals near you." },
                { number: "02", title: "Choose a professional", description: "Compare profiles, experience, availability, and customer reviews." },
                { number: "03", title: "Request a booking", description: "Submit your service request and manage it from your dashboard." },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-slate-200 bg-white p-8"
                >
                  <span className="text-4xl font-extrabold text-emerald-200">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why LocalWorker */}
        <section id="why-us" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="font-semibold text-emerald-600">WHY LOCALWORKER?</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              A simpler way to connect locally
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon size={30} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-700 px-7 py-12 text-white sm:px-12 sm:py-16">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="font-semibold text-emerald-200">
                  JOIN LOCALWORKER
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
                  Are you a skilled professional?
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-emerald-100">
                  Create your professional profile and connect with customers
                  looking for local services.
                </p>
              </div>

              <a
                href="/register"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                Join as a worker <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              L
            </div>
            <span className="text-lg font-extrabold">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </a>

          <p className="text-sm text-slate-500">
            Connecting communities with local professionals.
          </p>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} LocalWorker
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;