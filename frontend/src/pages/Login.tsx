
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wrench,
  LoaderCircle,
} from "lucide-react";
import api from "../api/axios";

interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  role?: string;
  email?: string;
  name?: string;
  user?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    role?: string;
    email?: string;
    name?: string;
  };
}

function Login() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google OAuth login
  const handleGoogleLogin = () => {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8080/api";

    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    window.location.href =
      `${backendUrl}/oauth2/authorization/google`;
  };

  // Existing email/password login
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;
      const user = data?.user;

      const token =
        data?.token ??
        data?.accessToken ??
        data?.jwt ??
        user?.token ??
        user?.accessToken ??
        user?.jwt;

      const role = data?.role ?? user?.role;

      if (!token) {
        throw new Error("Login response does not contain a token.");
      }

      if (!role) {
        throw new Error("Login response does not contain an account role.");
      }

      const normalizedRole = role.toUpperCase().replace(/^ROLE_/, "");

      if (!["CUSTOMER", "WORKER", "ADMIN"].includes(normalizedRole)) {
        throw new Error(`Unrecognized account role: ${normalizedRole}`);
      }

      // Save authentication details in this browser tab only.
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", normalizedRole);

      const authenticatedEmail =
        data.email ?? user?.email ?? email.trim();

      const authenticatedName =
        data.name ?? user?.name ?? "";

      sessionStorage.setItem("email", authenticatedEmail);

      if (authenticatedName.trim()) {
        sessionStorage.setItem("name", authenticatedName.trim());
      } else {
        sessionStorage.removeItem("name");
      }

      // Navigate according to account role.
      if (normalizedRole === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (normalizedRole === "WORKER") {
        navigate("/worker/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Invalid email or password. Please try again.");
        } else if (!err.response) {
          setError(
            "Cannot connect to the backend. Check that Spring Boot is running on port 8080.",
          );
        } else {
          setError(
            typeof err.response.data?.message === "string"
              ? err.response.data.message
              : `Login failed with status ${err.response.status}.`,
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left branding section */}
        <div className="relative hidden overflow-hidden bg-emerald-700 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/40 blur-3xl" />

          <Link to="/" className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-black text-emerald-700">
              L
            </div>
            <span className="text-2xl font-extrabold">LocalWorker</span>
          </Link>

          <div className="relative max-w-lg">
            <div className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck className="mr-2" size={18} />
              Your local service platform
            </div>

            <h1 className="text-5xl font-extrabold leading-tight xl:text-6xl">
              Welcome back.
              <span className="mt-2 block text-emerald-200">
                Let&apos;s get things done.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-emerald-100">
              Sign in to discover professionals, manage your bookings, and
              connect with your local community.
            </p>

            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5">
              <div className="rounded-xl bg-white/10 p-3">
                <Wrench size={27} />
              </div>
              <div>
                <p className="font-bold">Services made simple</p>
                <p className="mt-1 text-sm text-emerald-100">
                  Your next solution is just a few clicks away.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-emerald-100">
            © {new Date().getFullYear()} LocalWorker. All rights reserved.
          </p>
        </div>

        {/* Right login section */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft size={17} />
              Back to home
            </Link>

            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white">
                  L
                </div>
                <span className="text-xl font-extrabold">LocalWorker</span>
              </Link>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Sign in to your account
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                Enter your details to continue to LocalWorker.
              </p>
            </div>

            {/* Email and password login */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <Mail size={19} className="text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockKeyhole size={19} className="text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <LoaderCircle size={19} className="animate-spin" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Google OAuth */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.01 13.22l7.98 6.19C12.9 13.72 18.01 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.98 46.98 31.85 46.98 24.55Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.99 28.59a14.4 14.4 0 0 1-.76-4.59c0-1.6.28-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 3.01 10.78l7.98-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-5.99 0-11.1-4.22-13.01-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>

              Continue with Google
            </button>

            {/* Registration */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                New to LocalWorker?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Create an account
            </Link>

            <p className="mt-8 text-center text-xs leading-6 text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
