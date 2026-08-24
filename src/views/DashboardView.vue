<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-ink">
        Olá, {{ firstName }} 👋
      </h1>
      <p class="text-muted text-sm mt-1">Aqui está um resumo da sua carteira</p>
    </div>

    <!-- Error state -->
    <ErrorAlert v-if="accountsStore.error" :message="getErrorMessage(accountsStore.error)" class="mb-6" />

    <!-- Balance card -->
    <div class="mb-6">
      <BalanceCard :balance="accountsStore.balance" :loading="accountsStore.loading" />
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <SummaryCard
        icon="📈"
        label="Receitas no mês"
        :value="dashboard?.monthly_summary?.total_income"
        :subtitle="monthPeriod"
        icon-bg="bg-income-soft"
        value-color="text-income"
        :loading="accountsStore.loading"
      />
      <SummaryCard
        icon="📉"
        label="Despesas no mês"
        :value="dashboard?.monthly_summary?.total_expense"
        :subtitle="monthPeriod"
        icon-bg="bg-expense-soft"
        value-color="text-expense"
        :loading="accountsStore.loading"
      />
    </div>

    <!-- Recent transactions -->
    <RecentTransactions
      :transactions="dashboard?.last_transactions"
      :loading="accountsStore.loading"
    />
  </div>
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useAccountsStore } from '@/stores/accounts'
  import { getErrorMessage, formatDate } from '@/utils/currency'
  import BalanceCard from '@/components/dashboard/BalanceCard.vue'
  import SummaryCard from '@/components/dashboard/SummaryCard.vue'
  import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'

  const auth = useAuthStore()
  const accountsStore = useAccountsStore()

  const dashboard = computed(() => accountsStore.dashboard)

  const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'usuário')

  const monthPeriod = computed(() => {
    const s = dashboard.value?.monthly_summary?.period
    if (!s) return ''
    return `${formatDate(s.from)} – ${formatDate(s.to)}`
  })

  onMounted(() => accountsStore.fetchDashboard())
</script>
