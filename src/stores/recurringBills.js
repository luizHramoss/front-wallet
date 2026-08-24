import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recurringBillsApi } from '@/api/recurringBills'

export const useRecurringBillsStore = defineStore('recurringBills', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const activeBills = computed(() => items.value.filter((b) => b.status === 'active'))

  // Total mensal comprometido com contas fixas ativas (despesas) - visão
  // rápida de "quanto já está reservado" antes do Planejamento da Fase 6.
  const committedMonthlyExpense = computed(() =>
    activeBills.value
      .filter((b) => b.type === 'expense')
      .reduce((sum, b) => sum + Number(b.amount), 0)
  )

  async function fetchBills() {
    loading.value = true
    error.value = null
    try {
      const res = await recurringBillsApi.list()
      items.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function createBill(data) {
    const res = await recurringBillsApi.create(data)
    items.value.push(res.data.data)
    return res.data.data
  }

  async function updateBill(id, data) {
    const res = await recurringBillsApi.update(id, data)
    const idx = items.value.findIndex((b) => b.id === id)
    if (idx !== -1) items.value[idx] = res.data.data
    return res.data.data
  }

  async function deleteBill(id) {
    await recurringBillsApi.delete(id)
    items.value = items.value.filter((b) => b.id !== id)
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
    activeBills,
    committedMonthlyExpense,
    fetchBills,
    createBill,
    updateBill,
    deleteBill,
    $reset,
  }
})
