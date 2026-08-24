import { defineStore } from 'pinia'
import { ref } from 'vue'
import { investmentsApi } from '@/api/investments'

export const useInvestmentsStore = defineStore('investments', () => {
  const items = ref([])
  const summary = ref(null)
  const movements = ref([])
  const loading = ref(false)
  const movementsLoading = ref(false)
  const error = ref(null)

  async function fetchInvestments() {
    loading.value = true
    error.value = null
    try {
      const res = await investmentsApi.list()
      items.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const res = await investmentsApi.summary()
      summary.value = res.data.data
    } catch (e) {
      error.value = e
    }
  }

  async function createInvestment(data) {
    const res = await investmentsApi.create(data)
    items.value.push(res.data.data)
    return res.data.data
  }

  async function updateInvestment(id, data) {
    const res = await investmentsApi.update(id, data)
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx !== -1) items.value[idx] = res.data.data
    return res.data.data
  }

  async function deleteInvestment(id) {
    await investmentsApi.delete(id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  async function fetchMovements(id) {
    movementsLoading.value = true
    try {
      const res = await investmentsApi.listMovements(id)
      movements.value = res.data.data
    } finally {
      movementsLoading.value = false
    }
  }

  async function recordMovement(id, data) {
    const res = await investmentsApi.createMovement(id, data)
    // Reflete o movimento na posição localmente sem esperar um refetch -
    // o backend recalcula tudo, mas fetchInvestments() já é chamado pelo
    // caller logo em seguida pra pegar quantity/average_price atualizados.
    return res.data.data
  }

  function findById(id) {
    return items.value.find((i) => i.id === Number(id))
  }

  function $reset() {
    items.value = []
    summary.value = null
    movements.value = []
    loading.value = false
    movementsLoading.value = false
    error.value = null
  }

  return {
    items,
    summary,
    movements,
    loading,
    movementsLoading,
    error,
    fetchInvestments,
    fetchSummary,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    fetchMovements,
    recordMovement,
    findById,
    $reset,
  }
})
