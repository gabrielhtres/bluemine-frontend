import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    config.headers = config.headers || {};

    const isRefreshRequest = String(config.url || "").includes("/auth/refresh");

    // No refresh, o caller passa o refreshToken em Authorization. Não sobrescrever.
    if (isRefreshRequest) return config;

    // Se for FormData, deixa o browser/axios setar o Content-Type com boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      // axios normaliza header names internamente, então removemos ambos para segurança
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    // Se o caller já definiu Authorization, respeitar.
    if (config.headers.Authorization) return config;

    // Default: access token em todas as requests autenticadas
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    else delete config.headers.Authorization; // evita vazar header antigo via defaults

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, accessToken = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(accessToken);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o refresh falhar, encerra sessão
    if (originalRequest?.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((accessToken) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const { data } = await api.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const normalizedUser =
          data.user && typeof data.user === "object"
            ? { ...data.user, avatarUrl: data.user.avatarUrl || data.avatarUrl || null }
            : { name: data.user, avatarUrl: data.avatarUrl || null };

        useAuthStore.getState().setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          permissions: data.permissions,
          role: data.role,
          user: normalizedUser,
        });
        
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;