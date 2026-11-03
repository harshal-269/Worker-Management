
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../api/axios";

interface OAuthExchangeResponse {
  token: string;
  message: string;
  role: string;
}

function getEmailFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    return decoded.sub ?? "";
  } catch {
    return "";
  }
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "WORKER":
      return "/worker/dashboard";
    default:
      return "/customer/dashboard";
  }
}

function OAuthCallback() {
  const [error, setError] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const exchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      console.log("Google OAuth callback started.");
      console.log("Authorization code received:", Boolean(code));

      if (!code) {
        setError("Google authentication code is missing.");
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      try {
        console.log("Exchanging authorization code for JWT...");

        const response = await api.post<OAuthExchangeResponse>(
          "/auth/oauth/exchange",
          { code }
        );

        console.log("OAuth exchange response:", response.data);

        const token = response.data?.token;
        const role = response.data?.role;

        if (!token || !role) {
          throw new Error("JWT or user role is missing in API response.");
        }

        const normalizedRole = String(role)
          .toUpperCase()
          .replace(/^ROLE_/, "");

        if (!["CUSTOMER", "WORKER", "ADMIN"].includes(normalizedRole)) {
          throw new Error("Invalid account role: " + normalizedRole);
        }

        const email = getEmailFromToken(token);

        // Save authentication details.
        localStorage.setItem("token", token);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("email", email);

        console.log("Local Storage verification:", {
          tokenSaved: localStorage.getItem("token") === token,
          roleSaved: localStorage.getItem("role") === normalizedRole,
          emailSaved: localStorage.getItem("email") === email
        });

        console.log("Google login successful. Redirecting...");

        // Navigate to the correct dashboard.
        window.location.replace(getDashboardPath(normalizedRole));

      } catch (err: unknown) {
        console.error("Google OAuth callback error:", err);

        if (axios.isAxiosError(err)) {
          console.error("API response:", err.response?.data);

          setError(
            err.response?.data?.message ??
            err.message ??
            "Google login failed."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong during Google login.");
        }
      }
    };

    exchangeCode();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {error ? (
          <>
            <h2 className="text-xl font-bold text-red-600">
              Google Login Failed
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              {error}
            </p>

            <button
              onClick={() => {
                window.location.replace("/login");
              }}
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
              Please wait while we redirect you to your dashboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;
