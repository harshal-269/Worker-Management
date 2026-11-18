
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import api from "./api/axios";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OAuthCallback from "./pages/OAuthCallback";
import SelectRole from "./pages/SelectRole";

import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

interface RefreshResponse {
  token?: string;
  role?: string;
  email?: string;
  name?: string;
}

// Share one refresh request across React StrictMode effect executions.
let sessionRestorePromise: Promise<void> | null = null;

function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!sessionRestorePromise) {
      sessionRestorePromise = (async () => {
        // Existing access token: no restoration needed.
        if (sessionStorage.getItem("token")) {
          return;
        }

        try {
          const response = await api.post<RefreshResponse>(
            "/auth/refresh",
            {},
          );

          const data = response.data;

          if (!data.token) {
            throw new Error("No access token returned.");
          }

          sessionStorage.setItem("token", data.token);

          if (data.role) {
            sessionStorage.setItem("role", data.role);
          }

          if (data.email) {
            sessionStorage.setItem("email", data.email);
          }

          if (data.name) {
            sessionStorage.setItem("name", data.name);
          }
        } catch (error) {
          console.log("Session restoration failed:", error);

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("name");
        }
      })();
    }

    sessionRestorePromise.then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-emerald-600">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        Page Not Found
      </h2>

      <p className="mt-2 text-gray-500">
        Sorry, the page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
      >
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Google OAuth routes */}
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/select-role" element={<SelectRole />} />

          {/* Customer dashboard */}
          <Route
            path="/customer/dashboard/*"
            element={<CustomerDashboard />}
          />

          {/* Worker dashboard */}
          <Route
            path="/worker/dashboard/*"
            element={<WorkerDashboard />}
          />

          {/* Admin dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
