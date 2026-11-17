
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import NotificationBell from "../../pages/NotificationBell";

export interface DashboardNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardLayoutProps {
  title: string;
  description: string;
  navItems: DashboardNavItem[];
  basePath: string;
  userName: string;
  roleLabel: string;
  userAvatar?: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({
  title,
  description,
  navItems,
  basePath,
  userName,
  roleLabel,
  userAvatar,
  children,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const logout = () => {
    ["token", "role", "email", "name"].forEach((key) =>
      sessionStorage.removeItem(key)
    );

    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-900">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[84px] shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg shadow-emerald-600/20 transition-transform group-hover:scale-105">
              L
            </span>

            <span>
              <span className="block text-[21px] font-extrabold tracking-tight text-slate-950">
                Local<span className="text-emerald-600">Worker</span>
              </span>

              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Service marketplace
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close sidebar"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User profile */}
        <div className="border-b border-slate-100 px-4 py-5">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 to-white p-3">
            {userAvatar ?? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-700">
                {initials || "U"}
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold text-slate-900">
                {userName}
              </span>

              <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {roleLabel}
              </span>
            </span>

            <Sparkles size={16} className="shrink-0 text-emerald-400" />
          </div>
        </div>

        {/* Navigation heading */}
        <div className="px-6 pb-3 pt-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="Dashboard navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 pb-5"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const destination = `${basePath}/${item.path}`;

            return (
              <NavLink
                key={item.path}
                to={destination}
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 1.9}
                      className="shrink-0"
                    />

                    <span className="flex-1">{item.label}</span>

                    {!!item.badge && (
                      <span
                        className={`min-w-6 rounded-full px-2 py-0.5 text-center text-[11px] font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight size={16} className="shrink-0 opacity-80" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-2xl bg-[#102f26] p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-300" />
              <span className="text-xs font-bold text-emerald-200">
                LocalWorker
              </span>
            </div>

            <p className="mt-2 text-sm font-bold leading-5">
              Your neighbourhood, made easier.
            </p>

            <p className="mt-1 text-[11px] leading-5 text-emerald-100/70">
              Connecting people with trusted local professionals.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex min-h-[84px] items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                {roleLabel} workspace
              </p>

              <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                {title}
              </h1>

              <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-400 sm:block">
                {description}
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition hover:bg-emerald-50">
              <NotificationBell />
            </div>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              {userAvatar ?? (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                  {initials || "U"}
                </span>
              )}

              <div className="max-w-40">
                <p className="truncate text-sm font-extrabold text-slate-800">
                  {userName}
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
