<template>
  <div class="flex flex-col h-full">
    <!-- Logo -->
    <div class="px-6 h-16 flex items-center border-b border-border">
      <span class="text-xl font-bold text-accent-strong">💸 Digital Wallet</span>
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
            ? 'bg-accent/10 text-accent-strong'
            : 'text-muted hover:bg-surface-alt hover:text-ink'
        "
        @click="$emit('navigate')"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User + logout -->
    <div class="px-4 py-4 border-t border-border">
      <div class="flex items-center gap-3 mb-3 px-1">
        <div
          class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent-strong font-semibold text-sm flex-shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-ink truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-muted truncate">{{ auth.user?.email }}</p>
        </div>
      </div>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-alt hover:text-ink rounded-lg transition-colors"
        @click="toggleDark()"
      >
        <span>{{ isDark ? '☀️' : '🌙' }}</span> {{ isDark ? 'Modo claro' : 'Modo escuro' }}
      </button>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-soft rounded-lg transition-colors"
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
  import { useTheme } from '@/composables/useTheme'

  defineEmits(['logout', 'navigate'])

  const route = useRoute()
  const auth = useAuthStore()
  const { isDark, toggleDark } = useTheme()

  const navItems = [
    { name: 'Dashboard',       label: 'Dashboard',     icon: '🏠', to: { name: 'Dashboard' } },
    { name: 'Transactions',    label: 'Histórico',     icon: '📋', to: { name: 'Transactions' } },
    { name: 'Accounts',        label: 'Contas',        icon: '🏦', to: { name: 'Accounts' } },
    { name: 'Categories',      label: 'Categorias',    icon: '🏷️', to: { name: 'Categories' } },
    { name: 'RecurringBills',  label: 'Contas fixas',  icon: '📌', to: { name: 'RecurringBills' } },
  ]

  function isActive(to) {
    return route.name === to.name
  }

  const userInitials = computed(() => {
    const name = auth.user?.name ?? ''
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  })
</script>
