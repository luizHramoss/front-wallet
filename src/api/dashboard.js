import api from './axios'

export const dashboardApi = {
  get: () => api.get('/api/dashboard'),
}
