
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Snowflake,
  Sparkles,
  Menu,
  X,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  HeartHandshake,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

const services = [
  {
    name: "Plumbing",
    description: "Pipes, leaks & fittings",
    icon: Wrench,
    color: "bg-blue-50 text-blue-600",
    accent: "group-hover:bg-blue-100",
  },
  {
    name: "Electrical",
    description: "Repairs & installations",
    icon: Zap,
    color: "bg-amber-50 text-amber-600",
    accent: "group-hover:bg-amber-100",
  },
  {
    name: "Painting",
    description: "Refresh your spaces",
    icon: Paintbrush,
    color: "bg-violet-50 text-violet-600",
    accent: "group-hover:bg-violet-100",
  },
  {
    name: "Carpentry",
    description: "Furniture & woodwork",
    icon: Hammer,
    color: "bg-orange-50 text-orange-600",
    accent: "group-hover:bg-orange-100",
  },
  {
    name: "AC Repair",
    description: "Cooling & maintenance",
    icon: Snowflake,
    color: "bg-cyan-50 text-cyan-600",
    accent: "group-hover:bg-cyan-100",
  },
  {
    name: "Cleaning",
    description: "A cleaner, fresher home",
    icon: Sparkles,
    color: "bg-emerald-50 text-emerald-600",
    accent: "group-hover:bg-emerald-100",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Find local professionals",
    description:
      "Discover service providers in your area and explore their profiles before making a choice.",
  },
  {
    icon: CalendarCheck,
    title: "Convenient booking",
    description:
      "Send service requests and keep track of your bookings from one simple dashboard.",
  },
  {
    icon: Star,
    title: "Ratings and reviews",
    description:
      "Explore customer feedback to make a more informed decision when choosing a professional.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find your service",
    description:
      "Browse categories or search for the service you need in your neighbourhood.",
  },
  {
    number: "02",
    icon: HeartHandshake,
    title: "Choose a professional",
    description:
      "Explore worker profiles, services and customer feedback before deciding.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Request a booking",
    description:
      "Send your request and manage your service booking through your dashboard.",
  },
];

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openWorkerSearch = (service = "") => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (location.trim()) params.set("location", location.trim());
    if (service.trim()) params.set("service", service.trim());

    const query = params.toString();
    const role = sessionStorage.getItem("role");

    if (role === "CUSTOMER") {
      navigate(`/customer/dashboard${query ? `?${query}` : ""}`);
      return;
    }

    // Preserve requested filters through the login flow.
    sessionStorage.setItem("pendingWorkerSearch", query);

    navigate(`/login${query ? `?${query}` : ""}`);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openWorkerSearch();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white shadow-lg shadow-emerald-600/20 transition group-hover:rotate-[-5deg]">
              L
            </div>
            <span className="text-[22px] font-extrabold tracking-tight text-slate-900">
              Local<span className="text-emerald-600">Worker</span>
            </span>
          </a>

          <div className="hidden items-center gap-9 md:flex">
            <a href="#services" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
              Services
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
              How it works
            </a>
            <a href="#why-us" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
              Why LocalWorker
            </a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Get started <ArrowUpRight size={16} />
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-100 sm:hidden"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-xl sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a href="#services" onClick={closeMobileMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Services
              </a>
              <a href="#how-it-works" onClick={closeMobileMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                How it works
              </a>
              <a href="#why-us" onClick={closeMobileMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Why LocalWorker
              </a>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/login");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/register");
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#f5faf7]">
          <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[540px] w-[540px] rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-52 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-teal-200/30 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-20 md:grid-cols-[1.08fr_0.92fr] md:py-24 lg:gap-20 lg:px-8">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Your neighbourhood, made easier
              </div>

              <h1 className="max-w-2xl text-[42px] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px]">
                Your home deserves
                <span className="mt-2 block text-emerald-600">
                  the right hands.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                From everyday repairs to home improvements, connect with local
                professionals who can help you get things done.
              </p>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="mt-9 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)] sm:p-3"
              >
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Search size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="service" className="block text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                        What do you need?
                      </label>
                      <input
                        id="service"
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Try plumbing, cleaning..."
                        className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 sm:border-l sm:border-t-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <MapPin size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="location" className="block text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                        Your location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="Enter your city"
                        className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    Find a worker <ArrowRight size={17} />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Easy service discovery
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Simple booking requests
                </span>
              </div>
            </div>

            {/* Decorative service preview - all actions remain functional */}
            <div className="relative mx-auto w-full max-w-[490px]">
              <div className="absolute -right-8 top-10 h-36 w-36 rounded-full bg-emerald-300/30 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-teal-300/30 blur-3xl" />

              <div className="relative rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_30px_90px_-35px_rgba(15,70,50,0.3)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
                      LocalWorker marketplace
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                      What can we help with?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Explore popular home services.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                    <Wrench size={23} />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    {
                      name: "Home repairs",
                      detail: "Plumbing & electrical",
                      icon: Wrench,
                      service: "Plumbing",
                      color: "bg-blue-50 text-blue-600",
                    },
                    {
                      name: "Home improvement",
                      detail: "Painting & carpentry",
                      icon: Hammer,
                      service: "Painting",
                      color: "bg-orange-50 text-orange-600",
                    },
                    {
                      name: "Home maintenance",
                      detail: "Cleaning & AC repair",
                      icon: Sparkles,
                      service: "Cleaning",
                      color: "bg-purple-50 text-purple-600",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => openWorkerSearch(item.service)}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md"
                      >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                          <Icon size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900">{item.name}</h3>
                          <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                        </div>
                        <ArrowUpRight size={19} className="shrink-0 text-slate-300 transition group-hover:text-emerald-600" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl bg-[#102e25] p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-200">
                        Are you a skilled professional?
                      </p>
                      <p className="mt-1 text-lg font-extrabold">
                        Grow with LocalWorker.
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
                      <BriefcaseBusiness size={22} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-emerald-200"
                  >
                    Join as a professional <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BadgeCheck size={21} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Your local service hub</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Discover. Connect. Book.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Explore our services
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Help for every corner of your home.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                From quick fixes to bigger projects, find the right service for
                your next task.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openWorkerSearch()}
              className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-emerald-700 transition hover:gap-3"
            >
              Explore all services <ArrowRight size={17} />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <button
                  type="button"
                  key={service.name}
                  onClick={() => openWorkerSearch(service.name)}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_45px_-25px_rgba(16,185,129,0.35)] sm:p-5"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${service.color} ${service.accent} transition`}>
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 text-sm font-extrabold text-slate-900 sm:text-base">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {service.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700 opacity-0 transition group-hover:opacity-100">
                    Explore <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 bg-[#f7faf8] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Simple by design
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Getting things done is easier than ever.
              </h2>
              <p className="mt-4 leading-7 text-slate-500">
                A simple way to discover local help and manage your service
                requests.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Icon size={23} />
                      </div>
                      <span className="text-4xl font-black tracking-tight text-emerald-100">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-extrabold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {step.description}
                    </p>
                    {index < steps.length - 1 && (
                      <div className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 md:flex">
                        <ArrowRight size={15} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why LocalWorker */}
        <section id="why-us" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Why LocalWorker?
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Local help. Less hassle. More peace of mind.
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-slate-500">
                Finding someone to help around the house should feel simple.
                LocalWorker brings service discovery and booking requests into
                one convenient place.
              </p>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Get started <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className={`rounded-3xl border border-slate-200/80 p-6 ${
                      index === 0 ? "bg-emerald-50/70 sm:col-span-2" : "bg-white"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <Icon size={23} />
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Worker CTA */}
        <section className="px-5 pb-20 sm:pb-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#102e25] px-7 py-12 text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />
            <div className="pointer-events-none absolute -bottom-44 right-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                  <BriefcaseBusiness size={14} />
                  FOR LOCAL PROFESSIONALS
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Your skills deserve to be discovered.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-emerald-100/80">
                  Create your professional profile, showcase your services and
                  connect with customers looking for local help.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-emerald-100">
                  <span className="flex items-center gap-2">
                    <Check size={16} /> Create your profile
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={16} /> Showcase your services
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-extrabold text-emerald-900 shadow-xl transition hover:-translate-y-1 hover:bg-emerald-50"
              >
                Join as a professional <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <a href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-black text-white">
                  L
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Local<span className="text-emerald-600">Worker</span>
                </span>
              </a>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Connecting communities with local professionals, one service
                at a time.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-500">
              <a href="#services" className="transition hover:text-emerald-700">Services</a>
              <a href="#how-it-works" className="transition hover:text-emerald-700">How it works</a>
              <a href="#why-us" className="transition hover:text-emerald-700">Why LocalWorker</a>
              <button type="button" onClick={() => navigate("/login")} className="transition hover:text-emerald-700">
                Login
              </button>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} LocalWorker. All rights reserved.</p>
            <p>Made to bring local services closer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
