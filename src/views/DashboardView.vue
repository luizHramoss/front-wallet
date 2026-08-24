<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-ink">
        Olá, {{ firstName }} 👋
      </h1>
      <p class="text-muted text-sm mt-1">Aqui está um resumo das suas finanças</p>
    </div>

    <!-- Error state -->
    <ErrorAlert v-if="dashboardStore.error" :message="getErrorMessage(dashboardStore.error)" class="mb-6" />

    <!-- Balance card -->
    <div class="mb-6">
      <BalanceCard
        :balance="accountsStore.totalBalance"
        :loading="accountsStore.loading"
        @new-income="openQuickCreate('income')"
        @new-expense="openQuickCreate('expense')"
      />
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
        :loading="dashboardStore.loading"
      />
      <SummaryCard
        icon="📉"
        label="Despesas no mês"
        :value="dashboard?.monthly_summary?.total_expense"
        :subtitle="monthPeriod"
        icon-bg="bg-expense-soft"
        value-color="text-expense"
        :loading="dashboardStore.loading"
      />
    </div>

    <!-- Comprometido com contas fixas -->
    <RouterLink
      v-if="billsStore.committedMonthlyExpense > 0"
      :to="{ name: 'RecurringBills' }"
      class="card-hover flex items-center gap-4 mb-6"
    >
      <div class="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center text-lg">📌</div>
      <div>
        <p class="text-xs text-muted font-medium">Comprometido por mês com contas fixas</p>
        <p class="text-lg font-bold text-ink">{{ formatCurrency(billsStore.committedMonthlyExpense) }}</p>
      </div>
    </RouterLink>

    <!-- Recent transactions -->
    <RecentTransactions
      :transactions="dashboard?.last_transactions"
      :loading="dashboardStore.loading"
    />

    <TransactionFormModal
      v-model="modalOpen"
      :default-type="quickCreateType"
      @saved="refreshAll"
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useDashboardStore } from '@/stores/dashboard'
  import { useRecurringBillsStore } from '@/stores/recurringBills'
  import { getErrorMessage, formatDate, formatCurrency } from '@/utils/currency'
  import BalanceCard from '@/components/dashboard/BalanceCard.vue'
  import SummaryCard from '@/components/dashboard/SummaryCard.vue'
  import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue'

  const auth = useAuthStore()
  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const dashboardStore = useDashboardStore()
  const billsStore = useRecurringBillsStore()

  const dashboard = computed(() => dashboardStore.data)

  const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'usuário')

  const monthPeriod = computed(() => {
    const s = dashboard.value?.monthly_summary?.period
    if (!s) return ''
    return `${formatDate(s.from)} – ${formatDate(s.to)}`
  })

  const modalOpen = ref(false)
  const quickCreateType = ref('expense')

  function openQuickCreate(type) {
    quickCreateType.value = type
    modalOpen.value = true
  }

  function refreshAll() {
    dashboardStore.fetchDashboard()
    accountsStore.fetchAccounts()
  }

  onMounted(() => {
    dashboardStore.fetchDashboard()
    accountsStore.fetchAccounts()
    categoriesStore.fetchCategories()
    billsStore.fetchBills()
  })
</script>
