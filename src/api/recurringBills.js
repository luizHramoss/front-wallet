import api from './axios'

export const recurringBillsApi = {
  list: () => api.get('/api/recurring-bills'),
  create: (data) => api.post('/api/recurring-bills', data),
  update: (id, data) => api.patch(`/api/recurring-bills/${id}`, data),
  delete: (id) => api.delete(`/api/recurring-bills/${id}`),
}
