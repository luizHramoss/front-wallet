import api from './axios'

export const investmentsApi = {
  list: () => api.get('/api/investments'),
  summary: () => api.get('/api/investments/summary'),
  create: (data) => api.post('/api/investments', data),
  update: (id, data) => api.patch(`/api/investments/${id}`, data),
  delete: (id) => api.delete(`/api/investments/${id}`),
  listMovements: (id) => api.get(`/api/investments/${id}/movements`),
  createMovement: (id, data) => api.post(`/api/investments/${id}/movements`, data),
}
