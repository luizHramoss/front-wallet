import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriesApi } from '@/api/categories'

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const incomeCategories = computed(() => items.value.filter((c) => c.type === 'income'))
  const expenseCategories = computed(() => items.value.filter((c) => c.type === 'expense'))

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const res = await categoriesApi.list()
      items.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data) {
    const res = await categoriesApi.create(data)
    items.value.push(res.data.data)
    return res.data.data
  }

  async function updateCategory(id, data) {
    const res = await categoriesApi.update(id, data)
    const idx = items.value.findIndex((c) => c.id === id)
    if (idx !== -1) items.value[idx] = res.data.data
    return res.data.data
  }

  async function deleteCategory(id) {
    await categoriesApi.delete(id)
    items.value = items.value.filter((c) => c.id !== id)
  }

  function findById(id) {
    return items.value.find((c) => c.id === Number(id))
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
    incomeCategories,
    expenseCategories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    findById,
    $reset,
  }
})
