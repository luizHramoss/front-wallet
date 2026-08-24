<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Histórico</h1>
        <p class="text-muted text-sm mt-1">Todas as suas transações financeiras</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary btn-sm" :disabled="txStore.loading" @click="refresh">
          🔄 Atualizar
        </button>
        <button class="btn-primary btn-sm" @click="openCreate()">+ Nova transação</button>
      </div>
    </div>

    <!-- Filters -->
    <FilterBar :has-active-filters="hasActiveFilters">
      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Tipo</label>
        <select v-model="filters.type" class="input text-sm" @change="applyFilters">
          <option value="">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="transfer">Transferências</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Conta</label>
        <select v-model="filters.account_id" class="input text-sm" @change="applyFilters">
          <option value="">Todas</option>
          <option v-for="acc in accountsStore.activeAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-muted mb-1.5">Categoria</label>
        <select v-model="filters.category_id" class="input text-sm" @change="applyFilters">
          <option value="">Todas</option>
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
            {{ cat.icon ? `${cat.icon} ` : '' }}{{ cat.name }}
          </option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-muted mb-1.5">Por página</label>
          <select v-model="filters.per_page" class="input text-sm" @change="applyFilters">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
        <button class="btn-secondary btn-sm h-9 flex-shrink-0" @click="clearFilters">
          Limpar
        </button>
      </div>

      <template #badges>
        <span v-if="filters.type" class="badge badge-info">
          {{ typeMeta(filters.type).label }}
          <button class="ml-1 hover:opacity-70" @click="removeFilter('type')">×</button>
        </span>
        <span v-if="filters.account_id" class="badge badge-info">
          {{ accountsStore.findById(filters.account_id)?.name ?? 'Conta' }}
          <button class="ml-1 hover:opacity-70" @click="removeFilter('account_id')">×</button>
        </span>
        <span v-if="filters.category_id" class="badge badge-info">
          {{ categoriesStore.findById(filters.category_id)?.name ?? 'Categoria' }}
          <button class="ml-1 hover:opacity-70" @click="removeFilter('category_id')">×</button>
        </span>
        <span v-if="filters.date_from" class="badge badge-info">
          De: {{ formatDate(filters.date_from) }}
          <button class="ml-1 hover:opacity-70" @click="removeFilter('date_from')">×</button>
        </span>
        <span v-if="filters.date_to" class="badge badge-info">
          Até: {{ formatDate(filters.date_to) }}
          <button class="ml-1 hover:opacity-70" @click="removeFilter('date_to')">×</button>
        </span>
      </template>
    </FilterBar>

    <!-- Error -->
    <ErrorAlert v-if="txStore.error" :message="getErrorMessage(txStore.error)" class="mb-4" />

    <!-- Table -->
    <DataTable
      :items="txStore.items"
      :loading="txStore.loading"
      empty-icon="📋"
      empty-title="Nenhuma transação encontrada"
      :empty-description="hasActiveFilters ? 'Tente outros filtros.' : 'Crie sua primeira transação para começar.'"
    >
      <template #empty-action>
        <button v-if="!hasActiveFilters" class="mt-4 btn-primary btn-sm" @click="openCreate()">
          + Nova transação
        </button>
      </template>

      <template #row="{ item: tx }">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          :class="typeMeta(tx.type).iconBg"
        >
          {{ typeMeta(tx.type).icon }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-medium text-ink">
              {{ tx.description || categoryName(tx.category_id) || typeMeta(tx.type).label }}
            </p>
            <span class="badge text-xs" :class="typeMeta(tx.type).badge">
              {{ typeMeta(tx.type).badgeLabel }}
            </span>
            <span v-if="tx.status === 'planned'" class="badge badge-gray text-xs">
              Previsto
            </span>
          </div>
          <p class="text-xs text-muted mt-0.5">
            {{ accountName(tx.account_id) }} · {{ formatDate(tx.occurred_at) }}
            <span v-if="categoryName(tx.category_id)"> · {{ categoryName(tx.category_id) }}</span>
          </p>
        </div>

        <div class="text-right flex-shrink-0 flex items-center gap-2">
          <p class="text-sm font-bold" :class="typeMeta(tx.type).amountColor">
            {{ typeMeta(tx.type).sign }}{{ formatCurrency(tx.amount) }}
          </p>
          <DropdownMenu>
            <DropdownMenuItem v-if="tx.type !== 'transfer'" @click="openEdit(tx)">✏️ Editar</DropdownMenuItem>
            <DropdownMenuItem danger @click="confirmDelete(tx)">🗑️ Excluir</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </template>
    </DataTable>

    <!-- Pagination -->
    <PaginationBar :meta="txStore.meta" :loading="txStore.loading" @update:page="goToPage" />

    <TransactionFormModal v-model="modalOpen" :transaction="editingTransaction" @saved="onSaved" />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTransactionsStore } from '@/stores/transactions'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, formatDate, getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import FilterBar from '@/components/ui/FilterBar.vue'
  import DataTable from '@/components/ui/DataTable.vue'
  import PaginationBar from '@/components/ui/PaginationBar.vue'
  import DropdownMenu from '@/components/ui/DropdownMenu.vue'
  import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
  import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue'

  const route = useRoute()
  const txStore = useTransactionsStore()
  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const { success, error: notifyError } = useNotification()

  const TYPE_META = {
    income: { label: 'Receita', badgeLabel: 'Receita', icon: '⬆️', sign: '+', badge: 'badge-income', iconBg: 'bg-income-soft', amountColor: 'text-income' },
    expense: { label: 'Despesa', badgeLabel: 'Despesa', icon: '⬇️', sign: '-', badge: 'badge-expense', iconBg: 'bg-expense-soft', amountColor: 'text-expense' },
    transfer: { label: 'Transferência', badgeLabel: 'Transferência', icon: '↔️', sign: '', badge: 'badge-transfer', iconBg: 'bg-transfer-soft', amountColor: 'text-transfer' },
  }
  function typeMeta(type) {
    return TYPE_META[type] ?? TYPE_META.expense
  }

  function accountName(id) {
    return accountsStore.findById(id)?.name ?? 'Conta'
  }
  function categoryName(id) {
    return id ? (categoriesStore.findById(id)?.name ?? null) : null
  }

  // Filtros locais (sincronizados com a store ao aplicar)
  const filters = reactive({
    type: '',
    account_id: route.query.account_id ?? '',
    category_id: '',
    date_from: '',
    date_to: '',
    per_page: 15,
  })

  const hasActiveFilters = computed(
    () => filters.type || filters.account_id || filters.category_id || filters.date_from || filters.date_to
  )

  function applyFilters() {
    txStore.setFilter('type', filters.type)
    txStore.setFilter('account_id', filters.account_id)
    txStore.setFilter('category_id', filters.category_id)
    txStore.setFilter('date_from', filters.date_from)
    txStore.setFilter('date_to', filters.date_to)
    txStore.setFilter('per_page', filters.per_page)
    txStore.fetchTransactions()
  }

  function clearFilters() {
    filters.type = ''
    filters.account_id = ''
    filters.category_id = ''
    filters.date_from = ''
    filters.date_to = ''
    filters.per_page = 15
    txStore.resetFilters()
    txStore.fetchTransactions()
  }

  function removeFilter(key) {
    filters[key] = ''
    applyFilters()
  }

  function goToPage(page) {
    txStore.setFilter('page', page)
    txStore.fetchTransactions({ page })
  }

  function refresh() {
    txStore.fetchTransactions()
  }

  // ─── Modal de criação/edição ───────────────────────────────────────────
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

  function onSaved() {
    txStore.fetchTransactions()
    accountsStore.fetchAccounts()
  }

  async function confirmDelete(tx) {
    if (!confirm('Excluir esta transação? O saldo da conta é ajustado de volta.')) return

    try {
      await txStore.deleteTransaction(tx.id)
      await accountsStore.fetchAccounts()
      success('Transação excluída com sucesso.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(async () => {
    if (!accountsStore.items.length) await accountsStore.fetchAccounts()
    if (!categoriesStore.items.length) await categoriesStore.fetchCategories()
    if (filters.account_id) applyFilters()
    else txStore.fetchTransactions()
  })
</script>
