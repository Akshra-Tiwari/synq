import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'synq_access_token';

// Detect if running in production (not localhost)
const isProduction = typeof window !== 'undefined'
  && !window.location.hostname.includes('localhost')
  && !window.location.hostname.includes('127.0.0.1');

// Always use production URL when not on localhost
const BASE_URL = isProduction
  ? 'https://synq-api-z6kj.onrender.com/api/v1'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1');

const apiClient = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  timeout:         60000, // 60s for Render cold starts
  headers:         { 'Content-Type': 'application/json' },
});

// ── Attach token ──────────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Silent refresh on 401 ─────────────────────────────────────────────────────
let refreshing    = false;
let refreshQueue: ((token: string) => void)[] = [];

const drainQueue = (token: string) => { refreshQueue.forEach(cb => cb(token)); refreshQueue = []; };
const failQueue  = ()              => { refreshQueue.forEach(cb => cb(''));    refreshQueue = []; };

apiClient.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const req    = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    const isAuthEndpoint = req?.url?.includes('/auth/login')
      || req?.url?.includes('/auth/register')
      || req?.url?.includes('/auth/refresh');

    if (status === 401 && !req._retry && !isAuthEndpoint) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) return reject(error);
            req.headers.Authorization = `Bearer ${token}`;
            req._retry = true;
            resolve(apiClient(req));
          });
        });
      }

      req._retry = true;
      refreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.data?.accessToken ?? data.accessToken;
        if (!newToken) throw new Error('No token');
        localStorage.setItem(TOKEN_KEY, newToken);
        drainQueue(newToken);
        req.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(req);
      } catch {
        failQueue();
        localStorage.removeItem(TOKEN_KEY);
        if (typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
