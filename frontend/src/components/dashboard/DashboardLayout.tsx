import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Menu, X, LogOut } from "lucide-react";
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
      sessionStorage.removeItem(key),
    );
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white shadow-sm shadow-emerald-600/20">
              L
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">
                Local<span className="text-emerald-600">Worker</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Service platform
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-emerald-50/80 p-3">
            {userAvatar ?? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {initials || "U"}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">
                {userName}
              </span>
              <span className="block text-xs font-medium text-emerald-700">
                {roleLabel}
              </span>
            </span>
          </div>
        </div>

        <div className="px-6 pb-3 pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </div>

        <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const destination = `${basePath}/${item.path}`;
            return (
              <NavLink
                key={item.path}
                to={destination}
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.9} />
                <span className="flex-1">{item.label}</span>
                {!!item.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                {roleLabel} workspace
              </p>
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <NotificationBell />
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              {userAvatar ?? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  {initials || "U"}
                </span>
              )}
              <div className="max-w-40">
                <p className="truncate text-sm font-bold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
