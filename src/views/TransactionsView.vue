<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Histórico</h1>
        <p class="text-gray-500 text-sm mt-1">Todas as suas transações financeiras</p>
      </div>
      <button
        class="btn-secondary btn-sm"
        :disabled="txStore.loading"
        @click="refresh"
      >
        🔄 Atualizar
      </button>
    </div>

    <!-- Filters card -->
    <div class="card mb-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tipo -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
          <select
            v-model="filters.type"
            class="input text-sm"
            @change="applyFilters"
          >
            <option value="">Todos</option>
            <option value="credit">Depósitos</option>
            <option value="debit">Saques</option>
          </select>
        </div>

        <!-- Data inicial -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">Data inicial</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="input text-sm"
            @change="applyFilters"
          />
        </div>

        <!-- Data final -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">Data final</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="input text-sm"
            :min="filters.date_from"
            @change="applyFilters"
          />
        </div>

        <!-- Por página + clear -->
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Por página</label>
            <select v-model="filters.per_page" class="input text-sm" @change="applyFilters">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>
          <button
            class="btn-secondary btn-sm h-9 flex-shrink-0"
            @click="clearFilters"
          >
            Limpar
          </button>
        </div>
      </div>

      <!-- Filter summary badges -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        <span v-if="filters.type" class="badge badge-blue">
          {{ filters.type === 'credit' ? 'Depósitos' : 'Saques' }}
          <button class="ml-1 hover:text-blue-900" @click="removeFilter('type')">×</button>
        </span>
        <span v-if="filters.date_from" class="badge badge-blue">
          De: {{ formatDate(filters.date_from) }}
          <button class="ml-1 hover:text-blue-900" @click="removeFilter('date_from')">×</button>
        </span>
        <span v-if="filters.date_to" class="badge badge-blue">
          Até: {{ formatDate(filters.date_to) }}
          <button class="ml-1 hover:text-blue-900" @click="removeFilter('date_to')">×</button>
        </span>
      </div>
    </div>

    <!-- Error -->
    <ErrorAlert v-if="txStore.error" :message="getErrorMessage(txStore.error)" class="mb-4" />

    <!-- Table card -->
    <div class="card p-0 overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="txStore.loading" class="divide-y divide-gray-50">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-4 px-6 py-4 animate-pulse"
        >
          <div class="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 bg-gray-100 rounded w-20" />
            <div class="h-3 bg-gray-100 rounded w-32" />
          </div>
          <div class="space-y-2 text-right">
            <div class="h-3.5 bg-gray-100 rounded w-24 ml-auto" />
            <div class="h-3 bg-gray-100 rounded w-16 ml-auto" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="!txStore.items.length"
        icon="📋"
        title="Nenhuma transação encontrada"
        :description="hasActiveFilters ? 'Tente outros filtros.' : 'Faça seu primeiro depósito para começar.'"
        class="py-20"
      >
        <RouterLink
          v-if="!hasActiveFilters"
          :to="{ name: 'Deposit' }"
          class="mt-4 btn-primary btn-sm"
        >
          ⬆️ Fazer depósito
        </RouterLink>
      </EmptyState>

      <!-- Rows -->
      <ul v-else class="divide-y divide-gray-50">
        <TransitionGroup name="fade">
          <li
            v-for="tx in txStore.items"
            :key="tx.id"
            class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <!-- Icon -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              :class="tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'"
            >
              {{ tx.type === 'credit' ? '⬆️' : '⬇️' }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900">
                  {{ tx.type === 'credit' ? 'Depósito' : 'Saque' }}
                </p>
                <span
                  class="badge text-xs"
                  :class="tx.type === 'credit' ? 'badge-green' : 'badge-red'"
                >
                  {{ tx.type === 'credit' ? 'Crédito' : 'Débito' }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDateTime(tx.created_at) }}</p>
            </div>

            <!-- Values -->
            <div class="text-right flex-shrink-0">
              <p
                class="text-sm font-bold"
                :class="tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'"
              >
                {{ tx.type === 'credit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                Saldo: {{ formatCurrency(tx.balance_after) }}
              </p>
            </div>
          </li>
        </TransitionGroup>
      </ul>
    </div>

    <!-- Pagination -->
    <div
      v-if="txStore.meta && txStore.meta.last_page > 1"
      class="flex items-center justify-between mt-5"
    >
      <p class="text-sm text-gray-500">
        Mostrando {{ showingFrom }}–{{ showingTo }} de {{ txStore.meta.total }}
      </p>

      <div class="flex items-center gap-1">
        <button
          class="btn-secondary btn-sm"
          :disabled="currentPage === 1 || txStore.loading"
          @click="goToPage(currentPage - 1)"
        >
          ←
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-sm min-w-[36px]"
          :class="p === currentPage ? 'btn-primary' : 'btn-secondary'"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn-secondary btn-sm"
          :disabled="currentPage === txStore.meta.last_page || txStore.loading"
          @click="goToPage(currentPage + 1)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useTransactionsStore } from '@/stores/transactions'
  import { formatCurrency, formatDateTime, formatDate, getErrorMessage } from '@/utils/currency'
  import EmptyState from '@/components/ui/EmptyState.vue'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'

  const txStore = useTransactionsStore()

  // Filtros locais (sincronizados com a store ao aplicar)
  const filters = reactive({
    type: '',
    date_from: '',
    date_to: '',
    per_page: 15,
  })

  const currentPage = computed(() => txStore.meta?.current_page ?? 1)

  const hasActiveFilters = computed(
    () => filters.type || filters.date_from || filters.date_to
  )

  const showingFrom = computed(() => {
    const meta = txStore.meta
    if (!meta) return 0
    return (meta.current_page - 1) * meta.per_page + 1
  })

  const showingTo = computed(() => {
    const meta = txStore.meta
    if (!meta) return 0
    return Math.min(meta.current_page * meta.per_page, meta.total)
  })

  const visiblePages = computed(() => {
    const last = txStore.meta?.last_page ?? 1
    const cur = currentPage.value
    const pages = []
    const delta = 2
    for (let i = Math.max(1, cur - delta); i <= Math.min(last, cur + delta); i++) {
      pages.push(i)
    }
    return pages
  })

  function applyFilters() {
    txStore.setFilter('type', filters.type)
    txStore.setFilter('date_from', filters.date_from)
    txStore.setFilter('date_to', filters.date_to)
    txStore.setFilter('per_page', filters.per_page)
    txStore.fetchTransactions()
  }

  function clearFilters() {
    filters.type = ''
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

  onMounted(() => txStore.fetchTransactions())
</script>
