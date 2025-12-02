import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const axiosInstance: AxiosInstance = axios.create({
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

// Setup interceptors - called after auth store is available
export function setupAxiosInterceptors(
  getAuthState: () => {
    access_token: string | null;
    refresh_token: string | null;
    updateTokens: (access_token: string, refresh_token: string) => void;
    clearAuth: () => void;
  },
  refreshTokenFn: (refresh_token: string) => Promise<{ access_token: string; refresh_token: string }>
) {
  // Attach Authorization header
  axiosInstance.interceptors.request.use((config) => {
    const { access_token } = getAuthState();
    if (access_token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    return config;
  });

  // Response interceptor handles 401 -> refresh -> retry
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config || {};

      // If no response or not 401, just reject
      if (!error.response || error.response?.status !== 401) {
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

      const { refresh_token, updateTokens, clearAuth } = getAuthState();

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
              resolve(axiosInstance(originalRequest));
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
        const { access_token: newAccessToken, refresh_token: newRefreshToken } = await refreshTokenFn(refresh_token);

        // Update tokens in store
        updateTokens(newAccessToken, newRefreshToken);

        // Update original request with new token and retry
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Resolve queued requests
        processQueue(newAccessToken);

        return axiosInstance(originalRequest);
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
}

export default axiosInstance;
