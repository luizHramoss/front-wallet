import api from './axios'

export const transactionsApi = {
  list: (params = {}) => api.get('/api/transactions', { params }),
}
