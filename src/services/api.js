import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { normalizeUser } from '../utils/normalizeUser';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const store = useAuthStore.getState();
    
    // Se está fazendo logout, cancela a requisição
    if (store.isLoggingOut) {
      return Promise.reject(new Error("Logout em andamento"));
    }
    
    const accessToken = store.accessToken;
    config.headers = config.headers || {};

    const isRefreshRequest = String(config.url || "").includes("/auth/refresh");
    const isLoginRequest = String(config.url || "").includes("/auth/login");
    const isRegisterRequest = String(config.url || "").includes("/auth/register");
    
    // Para requisições de login/register/refresh, não adiciona token
    if (isRefreshRequest || isLoginRequest || isRegisterRequest) {
      return config;
    }

    // Se for FormData, deixa o browser/axios setar o Content-Type com boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      // axios normaliza header names internamente, então removemos ambos para segurança
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    // Se o caller já definiu Authorization, respeitar.
    if (config.headers.Authorization) return config;

    // Default: access token em todas as requests autenticadas
    if (accessToken && !store.isLoggingOut) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization; // evita vazar header antigo via defaults
    }

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

    // Tratamento de erros de rede (sem response)
    if (!error.response) {
      // Erro de rede - não tentar refresh
      return Promise.reject(error);
    }

    // Se o refresh falhar, encerra sessão e bloqueia novas requisições
    if (originalRequest?.url?.includes("/auth/refresh")) {
      const store = useAuthStore.getState();
      store.logout();
      // Processa a fila de requisições com erro para evitar requisições pendentes
      processQueue(new Error("Refresh token inválido ou expirado"), null);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está fazendo refresh, aguarda na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((accessToken) => {
            if (!accessToken) {
              // Se não recebeu token, rejeita a requisição
              return Promise.reject(new Error("Falha ao renovar token"));
            }
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
        const store = useAuthStore.getState();
        const { refreshToken } = store;

        if (!refreshToken) {
          // Não tem refreshToken, limpa tudo e rejeita
          store.logout();
          processQueue(new Error("Refresh token não encontrado"), null);
          return Promise.reject(error);
        }

        const { data } = await api.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const normalizedUser = normalizeUser(data.user, data.avatarUrl);

        store.setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          permissions: data.permissions,
          role: data.role,
          user: normalizedUser,
        });
        
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        // Processa fila com sucesso
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou - limpa sessão e processa fila com erro
        const store = useAuthStore.getState();
        store.logout();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;