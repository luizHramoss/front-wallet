import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { transactionsApi } from '@/api/transactions'

export const useTransactionsStore = defineStore('transactions', () => {
  const items = ref([])
  const meta = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const filters = reactive({
    type: '',
    date_from: '',
    date_to: '',
    per_page: 15,
    page: 1,
  })

  async function fetchTransactions(params = {}) {
    loading.value = true
    error.value = null
    try {
      const query = { ...filters, ...params }
      // Remove campos vazios
      Object.keys(query).forEach((k) => {
        if (query[k] === '' || query[k] === null) delete query[k]
      })
      const res = await transactionsApi.list(query)
      items.value = res.data.data
      meta.value = res.data.meta
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters[key] = value
    filters.page = 1
  }

  function resetFilters() {
    filters.type = ''
    filters.date_from = ''
    filters.date_to = ''
    filters.per_page = 15
    filters.page = 1
  }

  function $reset() {
    items.value = []
    meta.value = null
    loading.value = false
    error.value = null
    resetFilters()
  }

  return { items, meta, loading, error, filters, fetchTransactions, setFilter, resetFilters, $reset }
})
