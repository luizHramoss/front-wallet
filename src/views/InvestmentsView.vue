<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Investimentos</h1>
        <p class="text-muted text-sm mt-1">Sua carteira e o quanto você guardou este mês</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate()">+ Novo ativo</button>
    </div>

    <!-- Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        icon="💼"
        label="Total investido"
        :value="summary?.total_invested"
        icon-bg="bg-accent/10"
        value-color="text-ink"
        :loading="investmentsStore.loading"
      />
      <SummaryCard
        icon="📈"
        label="Valor atual"
        :value="summary?.total_current_value"
        :subtitle="rentabilitySubtitle"
        icon-bg="bg-income-soft"
        value-color="text-ink"
        :loading="investmentsStore.loading"
      />
      <SummaryCard
        icon="🛒"
        label="Investido este mês"
        :value="summary?.invested_this_month"
        icon-bg="bg-transfer-soft"
        value-color="text-transfer"
        :loading="investmentsStore.loading"
      />
      <SummaryCard
        icon="💰"
        label="Dividendos este mês"
        :value="summary?.dividends_this_month"
        icon-bg="bg-income-soft"
        value-color="text-income"
        :loading="investmentsStore.loading"
      />
    </div>

    <ErrorAlert v-if="investmentsStore.error" :message="getErrorMessage(investmentsStore.error)" class="mb-4" />

    <DataTable
      :items="investmentsStore.items"
      :loading="investmentsStore.loading"
      empty-icon="💼"
      empty-title="Nenhum ativo ainda"
      empty-description="Crie seu primeiro ativo e registre a primeira compra pra começar a acompanhar sua carteira."
    >
      <template #empty-action>
        <button class="mt-4 btn-primary btn-sm" @click="openCreate()">+ Novo ativo</button>
      </template>

      <template #row="{ item: inv }">
        <div class="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm flex-shrink-0">
          {{ typeIcon(inv.type) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-ink">{{ inv.name }}</p>
            <span v-if="inv.symbol" class="badge badge-gray text-xs">{{ inv.symbol }}</span>
          </div>
          <p class="text-xs text-muted mt-0.5">
            {{ inv.quantity }} un. · preço médio {{ formatCurrency(inv.average_price) }}
          </p>
        </div>

        <div class="text-right flex-shrink-0 flex items-center gap-3">
          <div>
            <p class="text-sm font-bold text-ink">{{ formatCurrency(inv.current_value) }}</p>
            <p
              v-if="inv.rentability_percent !== null"
              class="text-xs mt-0.5"
              :class="inv.rentability_percent >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ inv.rentability_percent >= 0 ? '+' : '' }}{{ inv.rentability_percent }}%
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuItem @click="openMovement(inv)">🔁 Novo movimento</DropdownMenuItem>
            <DropdownMenuItem @click="openHistory(inv)">📜 Ver movimentos</DropdownMenuItem>
            <DropdownMenuItem @click="openEdit(inv)">✏️ Editar</DropdownMenuItem>
            <DropdownMenuItem danger @click="confirmDelete(inv)">🗑️ Excluir</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </template>
    </DataTable>

    <InvestmentFormModal v-model="formModalOpen" :investment="editingInvestment" @saved="refreshAll" />
    <InvestmentMovementModal v-model="movementModalOpen" :investment="selectedInvestment" @saved="refreshAll" />
    <InvestmentMovementsHistoryModal v-model="historyModalOpen" :investment="selectedInvestment" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useInvestmentsStore } from '@/stores/investments'
  import { useAccountsStore } from '@/stores/accounts'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import DataTable from '@/components/ui/DataTable.vue'
  import DropdownMenu from '@/components/ui/DropdownMenu.vue'
  import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
  import SummaryCard from '@/components/dashboard/SummaryCard.vue'
  import InvestmentFormModal from '@/components/investments/InvestmentFormModal.vue'
  import InvestmentMovementModal from '@/components/investments/InvestmentMovementModal.vue'
  import InvestmentMovementsHistoryModal from '@/components/investments/InvestmentMovementsHistoryModal.vue'

  const investmentsStore = useInvestmentsStore()
  const accountsStore = useAccountsStore()
  const { success, error: notifyError } = useNotification()

  const summary = computed(() => investmentsStore.summary)

  const rentabilitySubtitle = computed(() => {
    const p = summary.value?.rentability_percent
    if (p === null || p === undefined) return ''
    return `${p >= 0 ? '+' : ''}${p}% de rentabilidade`
  })

  const TYPE_ICONS = { stock: '📊', fixed_income: '🏦', fund: '📦', crypto: '₿', other: '💼' }
  function typeIcon(type) {
    return TYPE_ICONS[type] ?? '💼'
  }

  const formModalOpen = ref(false)
  const movementModalOpen = ref(false)
  const historyModalOpen = ref(false)
  const editingInvestment = ref(null)
  const selectedInvestment = ref(null)

  function openCreate() {
    editingInvestment.value = null
    formModalOpen.value = true
  }

  function openEdit(investment) {
    editingInvestment.value = investment
    formModalOpen.value = true
  }

  function openMovement(investment) {
    selectedInvestment.value = investment
    movementModalOpen.value = true
  }

  function openHistory(investment) {
    selectedInvestment.value = investment
    historyModalOpen.value = true
  }

  function refreshAll() {
    investmentsStore.fetchInvestments()
    investmentsStore.fetchSummary()
    accountsStore.fetchAccounts()
  }

  async function confirmDelete(investment) {
    if (!confirm(`Excluir "${investment.name}"? O histórico de movimentos vai junto.`)) return

    try {
      await investmentsStore.deleteInvestment(investment.id)
      success('Ativo excluído com sucesso.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(() => {
    investmentsStore.fetchInvestments()
    investmentsStore.fetchSummary()
    if (!accountsStore.items.length) accountsStore.fetchAccounts()
  })
</script>
