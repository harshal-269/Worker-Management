
import axios, {
  type InternalAxiosRequestConfig,
} from "axios";

interface AuthResponse {
  token?: string;
  role?: string;
  email?: string;
  name?: string;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach the current access token to every API request.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }

    // Let the browser set the multipart boundary.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh the access token automatically when it expires.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post<AuthResponse>(
        `${baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      const newToken = response.data.token;

      if (!newToken) {
        throw new Error("Refresh response did not contain an access token.");
      }

      sessionStorage.setItem("token", newToken);

      if (response.data.role) {
        sessionStorage.setItem("role", response.data.role);
      }

      if (response.data.email) {
        sessionStorage.setItem("email", response.data.email);
      }

      if (response.data.name) {
        sessionStorage.setItem("name", response.data.name);
      }

      // Retry the original request with the new token.
      originalRequest.headers.set(
        "Authorization",
        `Bearer ${newToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed: the session is no longer valid.
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("name");

      return Promise.reject(refreshError);
    }
  },
);

export default api;
