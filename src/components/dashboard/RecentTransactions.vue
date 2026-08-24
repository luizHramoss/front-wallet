<template>
  <div class="card">
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-semibold text-ink">Últimas transações</h3>
      <RouterLink
        :to="{ name: 'Transactions' }"
        class="text-xs text-accent hover:text-accent-strong font-medium"
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
        <div class="w-9 h-9 rounded-full bg-surface-alt flex-shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 bg-surface-alt rounded w-24" />
          <div class="h-3 bg-surface-alt rounded w-32" />
        </div>
        <div class="h-4 bg-surface-alt rounded w-20" />
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
    <ul v-else class="divide-y divide-border">
      <li
        v-for="tx in transactions"
        :key="tx.id"
        class="flex items-center gap-3 py-3"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          :class="typeMeta(tx).iconBg"
        >
          {{ typeMeta(tx).icon }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-ink">
            {{ typeMeta(tx).label }}
          </p>
          <p class="text-xs text-muted">{{ formatDate(tx.occurred_at) }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-semibold" :class="typeMeta(tx).amountColor">
            {{ typeMeta(tx).sign }}{{ formatCurrency(tx.amount) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { formatCurrency, formatDate } from '@/utils/currency'
  import EmptyState from '@/components/ui/EmptyState.vue'

  defineProps({
    transactions: { type: Array, default: () => [] },
    loading:      { type: Boolean, default: false },
  })

  const TYPE_META = {
    income: { label: 'Receita', icon: '⬆️', sign: '+', iconBg: 'bg-income-soft', amountColor: 'text-income' },
    expense: { label: 'Despesa', icon: '⬇️', sign: '-', iconBg: 'bg-expense-soft', amountColor: 'text-expense' },
  }
  // Transferências: sem diferenciar por transfer_direction, "enviada" e
  // "recebida" ficavam visualmente idênticas (mesma cor, sem sinal).
  function typeMeta(tx) {
    if (tx.type === 'transfer') {
      const isOut = tx.transfer_direction === 'out'
      return {
        label: isOut ? 'Transferência enviada' : 'Transferência recebida',
        icon: '↔️',
        sign: isOut ? '-' : '+',
        iconBg: 'bg-transfer-soft',
        amountColor: isOut ? 'text-expense' : 'text-income',
      }
    }
    return TYPE_META[tx.type] ?? TYPE_META.expense
  }
</script>
