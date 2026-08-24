import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardApi } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      const res = await dashboardApi.get()
      data.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function $reset() {
    data.value = null
    loading.value = false
    error.value = null
  }

  return { data, loading, error, fetchDashboard, $reset }
})
