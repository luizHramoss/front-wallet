<template>
  <div class="card">
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-semibold text-gray-900">Últimas transações</h3>
      <RouterLink
        :to="{ name: 'Transactions' }"
        class="text-xs text-brand-600 hover:text-brand-700 font-medium"
      >
        Ver todas →
      </RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-3 animate-pulse"
      >
        <div class="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 bg-gray-100 rounded w-24" />
          <div class="h-3 bg-gray-100 rounded w-32" />
        </div>
        <div class="h-4 bg-gray-100 rounded w-20" />
      </div>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="!transactions?.length"
      icon="💳"
      title="Sem transações"
      description="Faça seu primeiro depósito para começar."
    />

    <!-- List -->
    <ul v-else class="divide-y divide-gray-50">
      <li
        v-for="tx in transactions"
        :key="tx.id"
        class="flex items-center gap-3 py-3"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          :class="tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'"
        >
          {{ tx.type === 'credit' ? '⬆️' : '⬇️' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ tx.type === 'credit' ? 'Depósito' : 'Saque' }}
          </p>
          <p class="text-xs text-gray-400">{{ formatDateTime(tx.created_at) }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p
            class="text-sm font-semibold"
            :class="tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'"
          >
            {{ tx.type === 'credit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </p>
          <p class="text-xs text-gray-400">{{ formatCurrency(tx.balance_after) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { formatCurrency, formatDateTime } from '@/utils/currency'
  import EmptyState from '@/components/ui/EmptyState.vue'

  defineProps({
    transactions: { type: Array, default: () => [] },
    loading:      { type: Boolean, default: false },
  })
</script>
