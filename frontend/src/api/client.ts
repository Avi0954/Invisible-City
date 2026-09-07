import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: inject Bearer Token if stored in localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: uniform error message formatting & token refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Format human-readable error message from backend
    const formatErrorMessage = (err: AxiosError<any>): string => {
      const data = err.response?.data;
      if (data?.error?.message) {
        return data.error.message;
      }
      if (typeof data?.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data?.detail)) {
        return data.detail
          .map((item: any) => {
            if (typeof item === 'string') return item;
            const field = item.loc ? item.loc.slice(1).join('.') : 'field';
            return `${field}: ${item.msg}`;
          })
          .join(', ');
      }
      if (data?.message) {
        return data.message;
      }
      if (err.code === 'ERR_NETWORK') {
        return 'Network error: Unable to connect to Invisible City API server.';
      }
      return err.message || 'An unexpected error occurred.';
    };

    const customError = {
      message: formatErrorMessage(error),
      status: error.response?.status || 500,
      details: error.response?.data?.error?.details || error.response?.data?.detail,
    };

    // If 401 Unauthorized and not already retried & not an auth endpoint (login/register/refresh)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(customError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:session_expired'));
        return Promise.reject(customError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(customError);
  }
);
