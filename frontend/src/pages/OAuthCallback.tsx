
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";

interface OAuthExchangeResponse {
  token?: string;
  message?: string;
  role?: string;
  email?: string;
  name?: string;
  requiresRoleSelection?: boolean;
  registrationToken?: string;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";

    case "WORKER":
      return "/worker/dashboard";

    case "CUSTOMER":
      return "/customer/dashboard";

    default:
      throw new Error("Unknown user role: " + role);
  }
}

function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    const exchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Remove the OAuth code from the browser URL.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );

      if (!code) {
        setError("Google authentication code is missing.");
        return;
      }

      try {
        const response = await api.post<OAuthExchangeResponse>(
          "/auth/oauth/exchange",
          { code },
        );

        const data = response.data;

        // New Google account: ask the user to select a role.
        if (data.requiresRoleSelection) {
          if (!data.registrationToken) {
            throw new Error(
              "Registration token is missing from the backend response.",
            );
          }

          // Clear authentication in this tab only.
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("name");

          // Store temporary Google registration details.
          sessionStorage.setItem(
            "googleRegistrationToken",
            data.registrationToken,
          );

          sessionStorage.setItem(
            "googleRegistrationEmail",
            data.email ?? "",
          );

          sessionStorage.setItem(
            "googleRegistrationName",
            data.name ?? "",
          );

          navigate("/select-role", { replace: true });
          return;
        }

        // Existing Google account: normal login.
        const token = data.token;
        const role = data.role;

        if (!token || !role) {
          throw new Error(
            "JWT or user role is missing in API response.",
          );
        }

        const normalizedRole = String(role)
          .trim()
          .toUpperCase()
          .replace(/^ROLE_/, "");

        if (!["CUSTOMER", "WORKER", "ADMIN"].includes(normalizedRole)) {
          throw new Error("Invalid account role: " + normalizedRole);
        }

        // Save authentication details in this browser tab only.
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", normalizedRole);
        sessionStorage.setItem("email", data.email ?? "");

        if (data.name?.trim()) {
          sessionStorage.setItem("name", data.name.trim());
        } else {
          sessionStorage.removeItem("name");
        }

        navigate(getDashboardPath(normalizedRole), {
          replace: true,
        });
      } catch (err: unknown) {
        console.error("Google OAuth callback error:", err);

        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ??
              err.message ??
              "Google login failed.",
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong during Google login.");
        }
      }
    };

    exchangeCode();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {error ? (
          <>
            <h2 className="text-xl font-bold text-red-600">
              Google Login Failed
            </h2>

            <p className="mt-3 text-sm text-slate-600">{error}</p>

            <button
              onClick={() => navigate("/login", { replace: true })}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Completing Google Login...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we process your Google account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;
