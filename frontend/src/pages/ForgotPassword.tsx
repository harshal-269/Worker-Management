
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

import api from "../api/axios";

type Step = "EMAIL" | "OTP" | "PASSWORD" | "SUCCESS";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("EMAIL");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

  // Request password reset OTP
  const handleSendOtp = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setStep("OTP");
      setMessage(
        "If an account exists with this email, a password reset OTP has been sent.",
      );
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("Forgot password request failed:", err);

      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Unable to process your request. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify reset OTP
  const handleVerifyOtp = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post<string>(
        "/auth/verify-reset-otp",
        {
          email: email.trim(),
          otp,
        },
        {
          responseType: "text",
        },
      );

      const token =
        typeof response.data === "string"
          ? response.data.trim().replace(/^"|"$/g, "")
          : "";

      if (!token) {
        throw new Error(
          "The server did not return a reset authorization token.",
        );
      }

      setResetToken(token);
      setStep("PASSWORD");
    } catch (err: unknown) {
      console.error("OTP verification failed:", err);

      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : typeof err.response?.data === "string"
              ? err.response.data
              : "Invalid or expired OTP. Please try again.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setOtp("");
      setMessage(
        "If an account exists with this email, a new OTP has been sent.",
      );
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("OTP resend failed:", err);

      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Unable to resend OTP. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password must not exceed 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        resetToken,
        newPassword,
      });

      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setStep("SUCCESS");
    } catch (err: unknown) {
      console.error("Password reset failed:", err);

      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : typeof err.response?.data === "string"
              ? err.response.data
              : "Unable to reset password. Please start again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep("EMAIL");
    setOtp("");
    setResetToken("");
    setError("");
    setMessage("");
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
            <span className="text-2xl font-extrabold">
              LocalWorker
            </span>
          </Link>

          <div className="relative max-w-lg">
            <div className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck className="mr-2" size={18} />
              Account security
            </div>

            <h1 className="text-5xl font-extrabold leading-tight xl:text-6xl">
              Your account.
              <span className="mt-2 block text-emerald-200">
                Your security.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-emerald-100">
              Recover access to your LocalWorker account with a
              secure email verification process.
            </p>

            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5">
              <div className="rounded-xl bg-white/10 p-3">
                <KeyRound size={27} />
              </div>

              <div>
                <p className="font-bold">
                  Secure password recovery
                </p>
                <p className="mt-1 text-sm text-emerald-100">
                  Verify your email before changing your password.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-emerald-100">
            © {new Date().getFullYear()} LocalWorker. All rights reserved.
          </p>
        </div>

        {/* Right content section */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/login"
              className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft size={17} />
              Back to login
            </Link>

            {/* Mobile branding */}
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white">
                  L
                </div>
                <span className="text-xl font-extrabold text-slate-900">
                  LocalWorker
                </span>
              </Link>
            </div>

            {/* Progress indicator */}
            {step !== "SUCCESS" && (
              <div className="mb-8 flex items-center gap-2">
                {["EMAIL", "OTP", "PASSWORD"].map((item, index) => {
                  const currentIndex = [
                    "EMAIL",
                    "OTP",
                    "PASSWORD",
                  ].indexOf(step);

                  const completed = index < currentIndex;
                  const active = index === currentIndex;

                  return (
                    <div
                      key={item}
                      className={`h-1.5 flex-1 rounded-full ${
                        completed || active
                          ? "bg-emerald-600"
                          : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
            )}

            {/* Email stage */}
            {step === "EMAIL" && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                    Account recovery
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Forgot your password?
                  </h2>

                  <p className="mt-3 leading-7 text-slate-500">
                    Enter your registered email address. We'll send
                    instructions to help you reset your password.
                  </p>
                </div>

                <form
                  onSubmit={handleSendOtp}
                  className="mt-8 space-y-5"
                >
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
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    )}
                    {loading ? "Sending OTP..." : "Send verification OTP"}
                  </button>
                </form>
              </>
            )}

            {/* OTP stage */}
            {step === "OTP" && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                    Email verification
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Verify your email
                  </h2>

                  <p className="mt-3 leading-7 text-slate-500">
                    Enter the six-digit OTP sent to{" "}
                    <span className="font-semibold text-slate-700">
                      {email}
                    </span>
                    .
                  </p>
                </div>

                <form
                  onSubmit={handleVerifyOtp}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Verification OTP
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        )
                      }
                      placeholder="Enter 6-digit OTP"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-xl font-bold tracking-[0.5em] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  {message && <InfoMessage message={message} />}
                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    )}
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={goBackToEmail}
                      disabled={loading}
                      className="font-semibold text-slate-500 transition hover:text-emerald-700"
                    >
                      Change email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || resendCooldown > 0}
                      className="font-semibold text-emerald-700 transition hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* New password stage */}
            {step === "PASSWORD" && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                    Create new password
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Reset your password
                  </h2>

                  <p className="mt-3 leading-7 text-slate-500">
                    Choose a new password for your LocalWorker account.
                  </p>
                </div>

                <form
                  onSubmit={handleResetPassword}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      New password
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                      <LockKeyhole
                        size={19}
                        className="text-slate-400"
                      />

                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                        className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
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

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Confirm new password
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                      <LockKeyhole
                        size={19}
                        className="text-slate-400"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                        className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        className="text-slate-400 transition hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Use at least 8 characters. Your new password will
                    replace your previous password.
                  </p>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    disabled={loading || !resetToken}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    )}
                    {loading ? "Updating password..." : "Reset password"}
                  </button>
                </form>
              </>
            )}

            {/* Success stage */}
            {step === "SUCCESS" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2
                    size={42}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-8 text-sm font-bold uppercase tracking-widest text-emerald-600">
                  Password updated
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                  You're all set!
                </h2>

                <p className="mt-4 leading-7 text-slate-500">
                  Your password has been reset successfully. You can
                  now sign in using your new password.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/login", { replace: true })}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <ArrowLeft size={18} />
                  Back to login
                </button>
              </div>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              Remember your password?{" "}
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
    >
      {message}
    </div>
  );
}

function InfoMessage({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
    >
      {message}
    </div>
  );
}

export default ForgotPassword;
