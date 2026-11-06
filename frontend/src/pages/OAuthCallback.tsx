
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../api/axios";

interface OAuthExchangeResponse {
  token: string;
  message: string;
  role: string;
  email?: string;
  name?: string;
}

function getEmailFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return "";
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));

    return decoded.sub ?? "";
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return "";
  }
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

      console.log("========== GOOGLE OAUTH DEBUG ==========");
      console.log("Current URL:", window.location.href);
      console.log("Authorization code received:", Boolean(code));

      if (!code) {
        setError("Google authentication code is missing.");
        console.error("OAuth authorization code is missing.");
        return;
      }

      // Remove the authorization code from the browser URL.
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

        console.log("OAuth exchange response received.");

        const token = response.data?.token;
        const role = response.data?.role;
        const name = response.data?.name;
        const responseEmail = response.data?.email;

        console.log("ROLE FROM BACKEND:", role);

        if (!token || !role) {
          throw new Error("JWT or user role is missing in API response.");
        }

        const normalizedRole = String(role)
          .trim()
          .toUpperCase()
          .replace(/^ROLE_/, "");

        console.log("NORMALIZED ROLE:", normalizedRole);

        if (!["CUSTOMER", "WORKER", "ADMIN"].includes(normalizedRole)) {
          throw new Error("Invalid account role: " + normalizedRole);
        }

        const email = getEmailFromToken(token);

        // Save authentication details.
        localStorage.setItem("token", token);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("email", responseEmail ?? email);

        if (name?.trim()) {
          localStorage.setItem("name", name.trim());
        } else {
          localStorage.removeItem("name");
        }

        // Verify saved authentication details.
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");
        const savedEmail = localStorage.getItem("email");
        const savedName = localStorage.getItem("name");

        console.log("ROLE AFTER SAVING:", savedRole);
        console.log("EMAIL AFTER SAVING:", savedEmail);
        console.log("NAME AFTER SAVING:", savedName);

        console.log("TOKEN SAVED:", savedToken === token);
        console.log("ROLE SAVED CORRECTLY:", savedRole === normalizedRole);
        console.log("EMAIL SAVED:", savedEmail === email);

        if (savedRole !== normalizedRole) {
          throw new Error("User role could not be saved correctly.");
        }

        const dashboardPath = getDashboardPath(normalizedRole);

        console.log("DASHBOARD PATH:", dashboardPath);
        console.log("Google login successful.");
        console.log("========================================");

        // Navigate to the dashboard based on the authenticated role.
        window.location.replace(dashboardPath);

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