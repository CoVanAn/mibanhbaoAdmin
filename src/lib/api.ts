import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { API_URL } from "../constants/api";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __adminAccessToken?: string;
  }
}

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

// Create axios instance with credentials enabled for HttpOnly cookies
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
  timeout: 30000, // 30 seconds default timeout
});

// Track if we're currently refreshing token to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Decode JWT and check if token is expiring soon (within 5 minutes)
 */
const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeLeft = exp - now;
    // Refresh if less than 5 minutes remaining
    return timeLeft < 5 * 60 * 1000;
  } catch (error) {
    // If can't decode, assume it's expiring
    return true;
  }
};

/**
 * Refresh access token using HttpOnly cookie
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    // Wait for ongoing refresh
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post(
      `${API_URL}/api/user/refresh-token`,
      {},
      { withCredentials: true, headers: { "x-client-type": "admin" } },
    );

    if (response.data.success) {
      const { accessToken } = response.data;

      // Store new access token in memory
      if (typeof window !== "undefined") {
        window.__adminAccessToken = accessToken;
      }

      // Update authorization header
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      isRefreshing = false;

      return accessToken;
    }

    isRefreshing = false;
    return null;
  } catch (error) {
    processQueue(error, null);
    isRefreshing = false;

    // Clear token on refresh failure
    if (typeof window !== "undefined") {
      delete window.__adminAccessToken;
    }

    throw error;
  }
};

// Request interceptor - add access token and proactively refresh if expiring soon
apiClient.interceptors.request.use(
  async (config) => {
    const token =
      typeof window !== "undefined" ? window.__adminAccessToken : null;

    if (token) {
      // Check if token is expiring soon (within 5 minutes)
      if (isTokenExpiringSoon(token)) {
        try {
          // Proactively refresh before making the request
          const newToken = await refreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          // If refresh fails, try with current token anyway
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Token still valid, use it
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle token refresh on 401 (fallback)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;

      // Don't retry for these endpoints to avoid infinite loops
      const isAuthEndpoint =
        originalRequest.url?.includes("/api/user/login") ||
        originalRequest.url?.includes("/api/user/refresh-token") ||
        originalRequest.url?.includes("/api/user/logout");

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // For TOKEN_EXPIRED, INVALID_TOKEN, or NO_TOKEN - try to refresh
      if (
        errorCode === "TOKEN_EXPIRED" ||
        errorCode === "INVALID_TOKEN" ||
        errorCode === "NO_TOKEN"
      ) {
        originalRequest._retry = true;

        try {
          // Call refresh token
          const newToken = await refreshAccessToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry original request with new token
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Clear token and redirect to login
          if (typeof window !== "undefined") {
            delete window.__adminAccessToken;
            // Dispatch custom event for auth failure
            window.dispatchEvent(new CustomEvent("auth:failed"));
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

// Helper to set access token in interceptor
export const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    window.__adminAccessToken = token;
  }
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Helper to clear access token
export const clearAccessToken = (): void => {
  if (typeof window !== "undefined") {
    delete window.__adminAccessToken;
  }
  delete apiClient.defaults.headers.common["Authorization"];
};

// Helper to get current access token
export const getAccessToken = (): string | undefined => {
  return typeof window !== "undefined" ? window.__adminAccessToken : undefined;
};

export default apiClient;
