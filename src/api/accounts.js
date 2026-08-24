import api from './axios'

export const accountsApi = {
  list: () => api.get('/api/accounts'),
  create: (data) => api.post('/api/accounts', data),
  update: (id, data) => api.patch(`/api/accounts/${id}`, data),
  archive: (id) => api.delete(`/api/accounts/${id}`),
}
