import axios from 'axios'

const api = axios.create({
  // Runtime config (window.__ENV__, written by docker/generate-env-config.sh
  // when the container starts) takes priority over the build-time Vite env
  // var, so the same image works across environments without a rebuild -
  // see the Dockerfile and docker/generate-env-config.sh.
  baseURL: window.__ENV__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor: injeta token ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wallet_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: trata 401 e normaliza erros ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wallet_token')
      localStorage.removeItem('wallet_user')
      // Redireciona sem importar o router (evita dependência circular)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
