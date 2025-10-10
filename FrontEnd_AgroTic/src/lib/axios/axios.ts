import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshFunction: (() => Promise<void>) | null = null;
let navigateFunction: ((path: string) => void) | null = null;

export const setupAxiosInterceptors = (refresh: () => Promise<void>, navigate: (path: string) => void) => {
  refreshFunction = refresh;
  navigateFunction = navigate;

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && refreshFunction && !error.config._retry && !error.config.url.startsWith('/auth/')) {
        try {
          await refreshFunction();
          // Mark the request as retried
          error.config._retry = true;
          // Retry the original request
          return apiClient(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          if (navigateFunction) {
            navigateFunction('/login');
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
