import api from './axios'

export const categoriesApi = {
  list: (params = {}) => api.get('/api/categories', { params }),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.patch(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
}
