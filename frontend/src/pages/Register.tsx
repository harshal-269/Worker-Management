import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  User,
  CheckCircle2,
} from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    // Backend integration will be added later.
    console.log("Registration form submitted", {
      name,
      email,
      phone,
      role,
    });

    alert("Registration form is ready. Backend integration is coming next!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden overflow-hidden bg-emerald-700 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/40 blur-3xl" />

          <Link to="/" className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-black text-emerald-700">
              L
            </div>

            <span className="text-2xl font-extrabold">LocalWorker</span>
          </Link>

          <div className="relative max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <CheckCircle2 size={18} />
              Join your local community
            </div>

            <h1 className="text-5xl font-extrabold leading-tight xl:text-6xl">
              One platform.
              <span className="mt-2 block text-emerald-200">
                Endless possibilities.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-emerald-100">
              Find trusted professionals for your home or grow your
              business by connecting with customers in your area.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <UserRound size={24} />
                </div>

                <div>
                  <p className="font-bold">For customers</p>
                  <p className="mt-1 text-sm text-emerald-100">
                    Discover and book local professionals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <BriefcaseBusiness size={24} />
                </div>

                <div>
                  <p className="font-bold">For professionals</p>
                  <p className="mt-1 text-sm text-emerald-100">
                    Showcase your skills and find opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-emerald-100">
            © {new Date().getFullYear()} LocalWorker. All rights reserved.
          </p>
        </div>

        {/* Registration form */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft size={17} />
              Back to home
            </Link>

            <div className="mb-7 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white">
                  L
                </div>

                <span className="text-xl font-extrabold">
                  LocalWorker
                </span>
              </Link>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                Get started today
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                Join LocalWorker and get connected with your community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <User size={19} className="text-slate-400" />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email */}
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
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Phone number
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <Phone size={19} className="text-slate-400" />

                  <span className="border-r border-slate-200 pr-3 text-sm text-slate-500">
                    +91
                  </span>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    pattern="[0-9]{10}"
                    required
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  I want to join as
                </label>

                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="CUSTOMER">Customer — Book services</option>
                  <option value="WORKER">Worker — Provide services</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockKeyhole size={19} className="text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockKeyhole size={19} className="text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Validation error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                Create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;