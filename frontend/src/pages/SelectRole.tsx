
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserRound,
  Wrench,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import api from "../api/axios";

interface RegistrationResponse {
  token: string;
  message: string;
  role: string;
  email?: string;
  name?: string;
}

type AccountRole = "CUSTOMER" | "WORKER";

function SelectRole() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<AccountRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = sessionStorage.getItem("googleRegistrationEmail") ?? "";
  const name = sessionStorage.getItem("googleRegistrationName") ?? "";

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select an account type.");
      return;
    }

    const registrationToken = sessionStorage.getItem(
      "googleRegistrationToken",
    );

    if (!registrationToken) {
      setError(
        "Your Google registration session has expired. Please sign in again.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post<RegistrationResponse>(
        "/auth/oauth/register",
        {
          registrationToken,
          role: selectedRole,
        },
      );

      const data = response.data;

      if (!data.token || !data.role) {
        throw new Error(
          "Registration response does not contain a valid token or role.",
        );
      }

      const normalizedRole = data.role
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, "");

      if (!["CUSTOMER", "WORKER"].includes(normalizedRole)) {
        throw new Error("Invalid account role received from backend.");
      }

      // Save authentication details in this browser tab only.
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", normalizedRole);
      sessionStorage.setItem("email", data.email ?? email);

      if (data.name?.trim()) {
        sessionStorage.setItem("name", data.name.trim());
      } else {
        sessionStorage.removeItem("name");
      }

      // Remove temporary Google registration information.
      sessionStorage.removeItem("googleRegistrationToken");
      sessionStorage.removeItem("googleRegistrationEmail");
      sessionStorage.removeItem("googleRegistrationName");

      // Navigate to the correct dashboard.
      if (normalizedRole === "WORKER") {
        navigate("/worker/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      console.error("Google registration failed:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Unable to complete registration. Please try again.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("googleRegistrationToken");
    sessionStorage.removeItem("googleRegistrationEmail");
    sessionStorage.removeItem("googleRegistrationName");

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ShieldCheck size={30} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
            Welcome to LocalWorker
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Choose your account type
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Tell us how you would like to use LocalWorker.
          </p>

          {name && (
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Welcome, {name}
            </p>
          )}

          {email && (
            <p className="mt-1 text-sm text-slate-400">{email}</p>
          )}
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setSelectedRole("CUSTOMER");
              setError("");
            }}
            className={`rounded-2xl border-2 p-6 text-left transition ${
              selectedRole === "CUSTOMER"
                ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/10"
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserRound size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Customer
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Find trusted local professionals and book services for your
              needs.
            </p>

            <div className="mt-5 text-sm font-bold text-emerald-700">
              {selectedRole === "CUSTOMER" ? "Selected ✓" : "Select Customer"}
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setSelectedRole("WORKER");
              setError("");
            }}
            className={`rounded-2xl border-2 p-6 text-left transition ${
              selectedRole === "WORKER"
                ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/10"
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Wrench size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Worker
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Offer your professional services and connect with customers
              around you.
            </p>

            <div className="mt-5 text-sm font-bold text-emerald-700">
              {selectedRole === "WORKER" ? "Selected ✓" : "Select Worker"}
            </div>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedRole || loading}
          onClick={handleContinue}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={19} />
            </>
          )}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="mt-4 w-full py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          Cancel and go back to login
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your account type will be saved and used for future logins.
        </p>
      </div>
    </div>
  );
}

export default SelectRole;
