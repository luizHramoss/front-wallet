import { defineStore } from 'pinia'
import { ref } from 'vue'
import { walletApi } from '@/api/wallet'

// Fase 1: still backed by the single default account exposed at
// /api/wallet/* (see WalletController) - full multi-account CRUD lands in
// Fase 2. Named accountsStore already so call sites don't need to change
// again when that happens.
export const useAccountsStore = defineStore('accounts', () => {
  const account = ref(null)
  const balance = ref(null)
  const dashboard = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchAccount() {
    loading.value = true
    error.value = null
    try {
      const res = await walletApi.getBalance()
      account.value = res.data.data
      balance.value = account.value.balance
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
    balance.value = Number(balance.value ?? 0) + Number(tx.amount)
    return tx
  }

  async function withdraw(amount) {
    const res = await walletApi.withdraw(amount)
    const tx = res.data.data
    balance.value = Number(balance.value ?? 0) - Number(tx.amount)
    return tx
  }

  function $reset() {
    account.value = null
    balance.value = null
    dashboard.value = null
    loading.value = false
    error.value = null
  }

  return { account, balance, dashboard, loading, error, fetchAccount, fetchDashboard, deposit, withdraw, $reset }
})
