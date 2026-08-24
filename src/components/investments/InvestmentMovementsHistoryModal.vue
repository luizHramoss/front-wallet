<template>
  <ModalDialog v-model="isOpen" :title="`Movimentos — ${investment?.name ?? ''}`">
    <div v-if="investmentsStore.movementsLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-12 bg-surface-alt rounded-lg animate-pulse" />
    </div>

    <EmptyState
      v-else-if="!investmentsStore.movements.length"
      icon="📜"
      title="Nenhum movimento ainda"
      description="Registre a primeira compra pra começar a formar a posição."
    />

    <ul v-else class="divide-y divide-border max-h-96 overflow-y-auto">
      <li v-for="m in investmentsStore.movements" :key="m.id" class="flex items-center justify-between py-3">
        <div>
          <span class="badge text-xs" :class="typeBadge(m.type)">{{ typeLabel(m.type) }}</span>
          <p class="text-xs text-muted mt-1">
            {{ formatDate(m.occurred_at) }}
            <span v-if="m.quantity !== null"> · {{ m.quantity }} un. × {{ formatCurrency(m.price) }}</span>
          </p>
        </div>
        <p class="text-sm font-semibold" :class="m.type === 'buy' ? 'text-expense' : 'text-income'">
          {{ m.type === 'buy' ? '-' : '+' }}{{ formatCurrency(m.amount) }}
        </p>
      </li>
    </ul>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Fechar</button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useInvestmentsStore } from '@/stores/investments'
  import { formatCurrency, formatDate } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import EmptyState from '@/components/ui/EmptyState.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    investment: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue'])

  const investmentsStore = useInvestmentsStore()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const TYPE_LABELS = { buy: 'Compra', sell: 'Venda', dividend: 'Dividendo' }
  const TYPE_BADGES = { buy: 'badge-expense', sell: 'badge-income', dividend: 'badge-info' }
  function typeLabel(type) {
    return TYPE_LABELS[type] ?? type
  }
  function typeBadge(type) {
    return TYPE_BADGES[type] ?? 'badge-gray'
  }

  watch(
    () => props.modelValue,
    (open) => {
      if (open && props.investment) investmentsStore.fetchMovements(props.investment.id)
    }
  )
</script>
