import { defineStore } from 'pinia'
import { ref } from 'vue'
import { walletApi } from '@/api/wallet'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(null)
  const dashboard = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchBalance() {
    loading.value = true
    error.value = null
    try {
      const res = await walletApi.getBalance()
      balance.value = res.data.data.balance
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      const res = await walletApi.getDashboard()
      dashboard.value = res.data.data
      balance.value = res.data.data.balance
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function deposit(amount) {
    const res = await walletApi.deposit(amount)
    const tx = res.data.data
    balance.value = tx.balance_after
    return tx
  }

  async function withdraw(amount) {
    const res = await walletApi.withdraw(amount)
    const tx = res.data.data
    balance.value = tx.balance_after
    return tx
  }

  function $reset() {
    balance.value = null
    dashboard.value = null
    loading.value = false
    error.value = null
  }

  return { balance, dashboard, loading, error, fetchBalance, fetchDashboard, deposit, withdraw, $reset }
})
