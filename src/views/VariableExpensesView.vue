<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Despesas variáveis</h1>
        <p class="text-muted text-sm mt-1">Mercado, lazer e outros gastos avulsos (sem vínculo com conta fixa)</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate()">+ Nova despesa</button>
    </div>

    <div class="card mb-5 flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-expense-soft flex items-center justify-center text-lg">🧾</div>
      <div>
        <p class="text-xs text-muted font-medium">Total no período</p>
        <p class="text-lg font-bold text-expense">{{ formatCurrency(total) }}</p>
      </div>
    </div>

    <FilterBar :has-active-filters="hasActiveFilters">
      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Data inicial</label>
        <input v-model="filters.date_from" type="date" class="input text-sm" @change="fetchItems" />
      </div>
      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Data final</label>
        <input v-model="filters.date_to" type="date" class="input text-sm" :min="filters.date_from" @change="fetchItems" />
      </div>
      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Categoria</label>
        <select v-model="filters.category_id" class="input text-sm" @change="fetchItems">
          <option value="">Todas</option>
          <option v-for="cat in categoriesStore.expenseCategories" :key="cat.id" :value="cat.id">
            {{ cat.icon ? `${cat.icon} ` : '' }}{{ cat.name }}
          </option>
        </select>
      </div>
      <div class="flex items-end">
        <button class="btn-secondary btn-sm h-9" @click="resetToCurrentMonth">Mês atual</button>
      </div>
    </FilterBar>

    <ErrorAlert v-if="error" :message="getErrorMessage(error)" class="mb-4" />

    <DataTable
      :items="items"
      :loading="loading"
      empty-icon="🧾"
      empty-title="Nenhuma despesa variável neste período"
      empty-description="Lançamentos avulsos de mercado, lazer, etc. aparecem aqui - use o botão acima pra registrar um."
    >
      <template #empty-action>
        <button class="mt-4 btn-primary btn-sm" @click="openCreate()">+ Nova despesa</button>
      </template>

      <template #row="{ item: tx }">
        <div class="w-9 h-9 rounded-full bg-expense-soft flex items-center justify-center text-sm flex-shrink-0">⬇️</div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-ink">{{ tx.description || categoryName(tx.category_id) || 'Despesa' }}</p>
          <p class="text-xs text-muted mt-0.5">
            {{ accountName(tx.account_id) }} · {{ formatDate(tx.occurred_at) }}
            <span v-if="categoryName(tx.category_id)"> · {{ categoryName(tx.category_id) }}</span>
          </p>
        </div>

        <div class="text-right flex-shrink-0 flex items-center gap-2">
          <p class="text-sm font-bold text-expense">-{{ formatCurrency(tx.amount) }}</p>
          <DropdownMenu>
            <DropdownMenuItem @click="openEdit(tx)">✏️ Editar</DropdownMenuItem>
            <DropdownMenuItem danger @click="confirmDelete(tx)">🗑️ Excluir</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </template>
    </DataTable>

    <TransactionFormModal v-model="modalOpen" :transaction="editingTransaction" default-type="expense" @saved="fetchItems" />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { transactionsApi } from '@/api/transactions'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, formatDate, getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import FilterBar from '@/components/ui/FilterBar.vue'
  import DataTable from '@/components/ui/DataTable.vue'
  import DropdownMenu from '@/components/ui/DropdownMenu.vue'
  import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
  import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue'

  // Estado local (não usa o transactionsStore compartilhado) - evita que os
  // filtros desta página "vazem" pra tela de Histórico e vice-versa, já que
  // Pinia stores são singletons por app.
  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const { success, error: notifyError } = useNotification()

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  function monthRange() {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
    return { from, to }
  }

  const { from, to } = monthRange()
  const filters = reactive({ date_from: from, date_to: to, category_id: '' })

  const hasActiveFilters = computed(() => filters.category_id !== '')

  const total = computed(() => items.value.reduce((sum, tx) => sum + Number(tx.amount), 0))

  function accountName(id) {
    return accountsStore.findById(id)?.name ?? 'Conta'
  }
  function categoryName(id) {
    return id ? (categoriesStore.findById(id)?.name ?? null) : null
  }

  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      const params = {
        type: 'expense',
        is_recurring: 'false',
        date_from: filters.date_from,
        date_to: filters.date_to,
        per_page: 100,
      }
      if (filters.category_id) params.category_id = filters.category_id

      const res = await transactionsApi.list(params)
      items.value = res.data.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function resetToCurrentMonth() {
    const { from, to } = monthRange()
    filters.date_from = from
    filters.date_to = to
    filters.category_id = ''
    fetchItems()
  }

  // ─── Modal ───────────────────────────────────────────────────────────
  const modalOpen = ref(false)
  const editingTransaction = ref(null)

  function openCreate() {
    editingTransaction.value = null
    modalOpen.value = true
  }

  function openEdit(tx) {
    editingTransaction.value = tx
    modalOpen.value = true
  }

  async function confirmDelete(tx) {
    if (!confirm('Excluir esta despesa? O saldo da conta é ajustado de volta.')) return

    try {
      await transactionsApi.delete(tx.id)
      await accountsStore.fetchAccounts()
      success('Despesa excluída com sucesso.')
      fetchItems()
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(async () => {
    if (!accountsStore.items.length) await accountsStore.fetchAccounts()
    if (!categoriesStore.items.length) await categoriesStore.fetchCategories()
    fetchItems()
  })
</script>
