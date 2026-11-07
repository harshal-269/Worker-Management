
import { useEffect, useState } from "react";
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
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // OTP resend countdown.
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCountdown((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const validateRegistration = () => {
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  // Step 1: Send OTP to email.
  const handleSendOtp = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateRegistration()) return;

    try {
      setLoading(true);

      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      };

      const response = await api.post(
        "/auth/register/send-otp",
        registrationData
      );

      setOtpSent(true);
      setVerified(false);
      setOtp("");
      setResendCountdown(30);

      setSuccess(
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
              "OTP sent successfully. Please check your email."
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null) ||
        "Unable to send OTP. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account.
  const handleVerifyOtp = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register/verify-otp",
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }
      );

      setVerified(true);

      setSuccess(
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
              "Email verified and account created successfully!"
      );

      // Clear sensitive registration details after success.
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setRole("CUSTOMER");
      setOtpSent(false);
      setResendCountdown(0);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null) ||
        "Invalid or expired OTP. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP using the same registration details.
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      };

      const response = await api.post(
        "/auth/register/send-otp",
        registrationData
      );

      setOtp("");
      setResendCountdown(30);

      setSuccess(
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
              "A new OTP has been sent to your email."
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null) ||
        "Unable to resend OTP. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setSuccess("");
    setResendCountdown(0);
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

            <span className="text-2xl font-extrabold">
              LocalWorker
            </span>
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

        {/* Registration section */}
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

            {/* Heading */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                {verified
                  ? "Registration completed"
                  : otpSent
                    ? "Email verification"
                    : "Get started today"}
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {verified
                  ? "You're all set!"
                  : otpSent
                    ? "Verify your email"
                    : "Create your account"}
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                {verified
                  ? "Your LocalWorker account has been created successfully."
                  : otpSent
                    ? `We've sent a verification code to ${email}. Enter it below to complete registration.`
                    : "Join LocalWorker and get connected with your community."}
              </p>
            </div>

            {/* Success screen */}
            {verified ? (
              <div className="mt-8 space-y-6">
                <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-9 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={34} />
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    Email verified successfully!
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your account is ready. You can now sign in to LocalWorker.
                  </p>
                </div>

                {success && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  >
                    {success}
                  </div>
                )}

                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Continue to login
                  <ArrowRight size={19} />
                </Link>
              </div>
            ) : otpSent ? (

              /* OTP verification form */
              <form
                onSubmit={handleVerifyOtp}
                className="mt-8 space-y-5"
              >
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <ShieldCheck size={23} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">
                        Verify your email address
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Check your inbox for the 6-digit code.
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 break-all text-sm font-semibold text-emerald-800">
                    {email}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Enter verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-extrabold tracking-[0.6em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Enter the 6-digit OTP sent to your email.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                  {!loading && <ArrowRight size={19} />}
                </button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || resendCountdown > 0}
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <RefreshCw size={15} />

                    {resendCountdown > 0
                      ? `Resend OTP in ${resendCountdown}s`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={handleEditDetails}
                    disabled={loading}
                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                  >
                    Change registration details
                  </button>
                </div>
              </form>

            ) : (

              /* Registration details form */
              <form
                onSubmit={handleSendOtp}
                className="mt-7 space-y-4"
              >
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
                        setPhone(
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
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
                    <option value="CUSTOMER">
                      Customer — Book services
                    </option>

                    <option value="WORKER">
                      Worker — Provide services
                    </option>
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
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

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  >
                    {success}
                  </div>
                )}

                {/* Send OTP */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending OTP..." : "Continue with email verification"}
                  {!loading && <ArrowRight size={19} />}
                </button>
              </form>
            )}

            {!verified && (
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}

                <Link
                  to="/login"
                  className="font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Sign in
                </Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
