import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/modules/auth/store";
import { refreshAccessToken } from "../../lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const restAxiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false, // Using Bearer tokens
});

// Track refresh in-flight to queue requests
let isRefreshing = false;
let pendingRequestsQueue: Array<(token: string | null) => void> = [];

// Helper to process queue after refresh resolves
function processQueue(newToken: string | null) {
  for (const callback of pendingRequestsQueue) {
    callback(newToken);
  }
  pendingRequestsQueue = [];
}

// Attach Authorization header
restAxiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles 401 -> refresh -> retry
restAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config || {};

    // If no response or not 401, just reject
    if (!error.response?.status || error.response.status !== 401) {
      throw error;
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      throw error;
    }

    // Avoid on auth endpoints
    const url = originalRequest.url || "";
    const isAuthEndpoint = /\/auth\/(login|refresh|reset-password|forget-password)/.test(url);
    if (isAuthEndpoint) {
      throw error;
    }

    const { refresh_token, updateTokens, clearAuth } = useAuthStore.getState();

    if (!refresh_token) {
      clearAuth();
      if (globalThis.window !== undefined) {
        globalThis.location.href = "/signin";
      }
      throw error;
    }

    // Queue the request if a refresh is already happening
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequestsQueue.push((newToken) => {
          if (newToken) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(restAxiosInstance(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // Mark as retry and begin refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh via API helper
      const { access_token: newAccessToken, refresh_token: newRefreshToken } = await refreshAccessToken(refresh_token);

      // Update tokens in store
      updateTokens(newAccessToken, newRefreshToken);

      // Update original request with new token and retry
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

      // Resolve queued requests
      processQueue(newAccessToken);

      return restAxiosInstance(originalRequest);
    } catch (error_) {
      processQueue(null);
      clearAuth();
      if (globalThis.window !== undefined) {
        globalThis.location.href = "/signin";
      }
      throw error_;
    } finally {
      isRefreshing = false;
    }
  },
);

export default restAxiosInstance;
