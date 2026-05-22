<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg">
    <!-- Decorative circles -->
    <div class="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
    <div class="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/10" />

    <div class="relative z-10">
      <p class="text-brand-200 text-sm font-medium mb-1">Saldo disponível</p>

      <div v-if="loading" class="h-10 w-48 bg-white/20 rounded-lg animate-pulse mb-1" />
      <h2 v-else class="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
        {{ formatCurrency(balance ?? 0) }}
      </h2>

      <p class="text-brand-200 text-xs">Atualizado agora</p>
    </div>

    <!-- Quick actions -->
    <div class="relative z-10 flex gap-3 mt-6">
      <RouterLink
        :to="{ name: 'Deposit' }"
        class="flex-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium py-2 px-4 rounded-xl text-center"
      >
        ⬆️ Depositar
      </RouterLink>
      <RouterLink
        :to="{ name: 'Withdraw' }"
        class="flex-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium py-2 px-4 rounded-xl text-center"
      >
        ⬇️ Sacar
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { formatCurrency } from '@/utils/currency'

  defineProps({
    balance: { type: Number, default: null },
    loading: { type: Boolean, default: false },
  })
</script>
