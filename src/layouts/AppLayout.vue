<template>
  <div class="min-h-screen bg-surface-alt flex">
    <!-- Sidebar desktop -->
    <aside
      class="hidden lg:flex flex-col w-64 bg-surface border-r border-border fixed inset-y-0 z-30"
    >
      <SidebarContent @logout="handleLogout" />
    </aside>

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 lg:hidden"
        @click="mobileOpen = false"
      >
        <div class="absolute inset-0 bg-black/40" />
        <aside
          class="absolute left-0 top-0 bottom-0 w-72 bg-surface flex flex-col"
          @click.stop
        >
          <SidebarContent @logout="handleLogout" @navigate="mobileOpen = false" />
        </aside>
      </div>
    </Transition>

    <!-- Main -->
    <div class="flex-1 lg:pl-64 flex flex-col min-h-screen">
      <!-- Topbar mobile -->
      <header
        class="lg:hidden sticky top-0 z-20 bg-surface border-b border-border px-4 h-14 flex items-center justify-between"
      >
        <button
          class="p-2 rounded-lg text-muted hover:bg-surface-alt"
          @click="mobileOpen = true"
        >
          <IconMenu class="w-5 h-5" />
        </button>
        <span class="font-semibold text-accent-strong">💸 Digital Wallet</span>
        <div class="w-9" />
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="slide-up" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { RouterView, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useTransactionsStore } from '@/stores/transactions'
  import { useRecurringBillsStore } from '@/stores/recurringBills'
  import { useInvestmentsStore } from '@/stores/investments'
  import { useDashboardStore } from '@/stores/dashboard'
  import { useNotification } from '@/composables/useNotification'
  import SidebarContent from '@/components/SidebarContent.vue'
  import IconMenu from '@/components/ui/IconMenu.vue'

  const router = useRouter()
  const auth = useAuthStore()
  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const txStore = useTransactionsStore()
  const billsStore = useRecurringBillsStore()
  const investmentsStore = useInvestmentsStore()
  const dashboardStore = useDashboardStore()
  const { error } = useNotification()

  const mobileOpen = ref(false)

  async function handleLogout() {
    try {
      await auth.logout()
      accountsStore.$reset()
      categoriesStore.$reset()
      txStore.$reset()
      billsStore.$reset()
      investmentsStore.$reset()
      dashboardStore.$reset()
      router.push({ name: 'Login' })
    } catch {
      error('Erro ao fazer logout.')
    }
  }
</script>
