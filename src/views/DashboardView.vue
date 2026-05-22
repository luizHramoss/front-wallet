<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Olá, {{ firstName }} 👋
      </h1>
      <p class="text-gray-500 text-sm mt-1">Aqui está um resumo da sua carteira</p>
    </div>

    <!-- Error state -->
    <ErrorAlert v-if="walletStore.error" :message="getErrorMessage(walletStore.error)" class="mb-6" />

    <!-- Balance card -->
    <div class="mb-6">
      <BalanceCard :balance="walletStore.balance" :loading="walletStore.loading" />
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <SummaryCard
        icon="📈"
        label="Total depositado no mês"
        :value="dashboard?.monthly_summary?.total_deposited"
        :subtitle="monthPeriod"
        icon-bg="bg-emerald-100"
        value-color="text-emerald-600"
        :loading="walletStore.loading"
      />
      <SummaryCard
        icon="📉"
        label="Total sacado no mês"
        :value="dashboard?.monthly_summary?.total_withdrawn"
        :subtitle="monthPeriod"
        icon-bg="bg-red-100"
        value-color="text-red-600"
        :loading="walletStore.loading"
      />
    </div>

    <!-- Recent transactions -->
    <RecentTransactions
      :transactions="dashboard?.last_transactions"
      :loading="walletStore.loading"
    />
  </div>
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useWalletStore } from '@/stores/wallet'
  import { getErrorMessage, formatDate } from '@/utils/currency'
  import BalanceCard from '@/components/dashboard/BalanceCard.vue'
  import SummaryCard from '@/components/dashboard/SummaryCard.vue'
  import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'

  const auth = useAuthStore()
  const walletStore = useWalletStore()

  const dashboard = computed(() => walletStore.dashboard)

  const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'usuário')

  const monthPeriod = computed(() => {
    const s = dashboard.value?.monthly_summary?.period
    if (!s) return ''
    return `${formatDate(s.from)} – ${formatDate(s.to)}`
  })

  onMounted(() => walletStore.fetchDashboard())
</script>
