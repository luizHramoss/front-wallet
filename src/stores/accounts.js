import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountsApi } from '@/api/accounts'

export const useAccountsStore = defineStore('accounts', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const activeAccounts = computed(() => items.value.filter((a) => !a.is_archived))
  const archivedAccounts = computed(() => items.value.filter((a) => a.is_archived))
  const totalBalance = computed(() =>
    activeAccounts.value.reduce((sum, a) => sum + Number(a.balance), 0)
  )

  async function fetchAccounts() {
    loading.value = true
    error.value = null
    try {
      const res = await accountsApi.list()
      items.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data) {
    const res = await accountsApi.create(data)
    items.value.push(res.data.data)
    return res.data.data
  }

  async function updateAccount(id, data) {
    const res = await accountsApi.update(id, data)
    const idx = items.value.findIndex((a) => a.id === id)
    if (idx !== -1) items.value[idx] = res.data.data
    return res.data.data
  }

  async function archiveAccount(id) {
    await accountsApi.archive(id)
    const account = items.value.find((a) => a.id === id)
    if (account) account.is_archived = true
  }

  function findById(id) {
    return items.value.find((a) => a.id === Number(id))
  }

  function $reset() {
    items.value = []
    loading.value = false
    error.value = null
  }

  return {
    items,
    loading,
    error,
    activeAccounts,
    archivedAccounts,
    totalBalance,
    fetchAccounts,
    createAccount,
    updateAccount,
    archiveAccount,
    findById,
    $reset,
  }
})
