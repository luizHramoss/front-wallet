<template>
  <div class="flex flex-col h-full">
    <!-- Logo -->
    <div class="px-6 h-16 flex items-center border-b border-gray-100">
      <span class="text-xl font-bold text-brand-700">💸 Digital Wallet</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        "
        @click="$emit('navigate')"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User + logout -->
    <div class="px-4 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3 mb-3 px-1">
        <div
          class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ auth.user?.email }}</p>
        </div>
      </div>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        @click="$emit('logout')"
      >
        <span>🚪</span> Sair
      </button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { RouterLink, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  defineEmits(['logout', 'navigate'])

  const route = useRoute()
  const auth = useAuthStore()

  const navItems = [
    { name: 'Dashboard',     label: 'Dashboard',   icon: '🏠', to: { name: 'Dashboard' } },
    { name: 'Deposit',       label: 'Depositar',   icon: '⬆️', to: { name: 'Deposit' } },
    { name: 'Withdraw',      label: 'Sacar',       icon: '⬇️', to: { name: 'Withdraw' } },
    { name: 'Transactions',  label: 'Histórico',   icon: '📋', to: { name: 'Transactions' } },
  ]

  function isActive(to) {
    return route.name === to.name
  }

  const userInitials = computed(() => {
    const name = auth.user?.name ?? ''
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  })
</script>
