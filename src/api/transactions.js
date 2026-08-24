import api from './axios'

export const transactionsApi = {
  list: (params = {}) => api.get('/api/transactions', { params }),
  create: (data) => api.post('/api/transactions', data),
  update: (id, data) => api.patch(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
}
