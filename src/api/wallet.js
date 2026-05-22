import api from './axios'

export const walletApi = {
  getBalance: () => api.get('/api/wallet'),
  getDashboard: () => api.get('/api/wallet/dashboard'),
  deposit: (amount) => api.post('/api/wallet/deposit', { amount }),
  withdraw: (amount) => api.post('/api/wallet/withdraw', { amount }),
}
