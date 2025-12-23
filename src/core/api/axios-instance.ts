import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false, // Using Bearer tokens
});

// Raw instance without interceptors (used for token refresh to avoid recursion)
export const rawAxiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

// Track refresh in-flight to queue requests
let isRefreshing = false;
let pendingRequestsQueue: Array<(token: string | null) => void> = [];

let requestInterceptorId: number | undefined;
let responseInterceptorId: number | undefined;

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
  // Avoid stacking interceptors during HMR / re-init
  if (requestInterceptorId !== undefined) {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== undefined) {
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  }

  // Attach Authorization header
  requestInterceptorId = axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { access_token } = getAuthState();
    if (access_token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    return config;
  });

  // Response interceptor handles 401 -> refresh -> retry
  responseInterceptorId = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const axiosError = error as AxiosError;
      const originalRequest: (AxiosRequestConfig & { _retry?: boolean }) | undefined =
        (axiosError.config as AxiosRequestConfig & { _retry?: boolean }) ?? undefined;

      // If no response or not 401, just reject
      const status = axiosError.response?.status;
      if (!status || status !== 401) {
        throw axiosError;
      }

      if (!originalRequest) {
        throw axiosError;
      }

      // Prevent infinite loop
      if (originalRequest._retry) {
        throw axiosError;
      }

      // Avoid on auth endpoints
      const url = originalRequest.url || "";
      const isAuthEndpoint =
        /\/admin\/auth\/(login|refresh-token|forgot-password|reset-password|logout)/.test(url) ||
        /\/auth\/(login|refresh|refresh-token|access_token|forgot-password|reset-password|logout)/.test(url);
      if (isAuthEndpoint) {
        throw axiosError;
      }

      const { refresh_token, updateTokens, clearAuth } = getAuthState();

      if (!refresh_token) {
        clearAuth();
        if (globalThis.window !== undefined) {
          globalThis.location.href = "/signin";
        }
        throw axiosError;
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
              reject(axiosError);
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

        const refreshErr = error_ as AxiosError;
        const refreshStatus = refreshErr.response?.status;

        // Only logout when refresh token is invalid/expired.
        // For transient errors (network/5xx), keep auth state so the app can retry later.
        if (refreshStatus === 401 || refreshStatus === 403) {
          clearAuth();
          if (globalThis.window !== undefined) {
            globalThis.location.href = "/signin";
          }
        }

        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    },
  );
}

export default axiosInstance;
