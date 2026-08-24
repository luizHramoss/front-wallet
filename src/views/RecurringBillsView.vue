<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Contas fixas</h1>
        <p class="text-muted text-sm mt-1">Aluguel, assinaturas e outras recorrências</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate()">+ Nova conta fixa</button>
    </div>

    <!-- Comprometido no mês -->
    <div class="card mb-5 flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center text-lg">📌</div>
      <div>
        <p class="text-xs text-muted font-medium">Comprometido por mês (despesas ativas)</p>
        <p class="text-lg font-bold text-ink">{{ formatCurrency(billsStore.committedMonthlyExpense) }}</p>
      </div>
    </div>

    <ErrorAlert v-if="billsStore.error" :message="getErrorMessage(billsStore.error)" class="mb-4" />

    <DataTable
      :items="billsStore.items"
      :loading="billsStore.loading"
      empty-icon="📌"
      empty-title="Nenhuma conta fixa"
      empty-description="Cadastre aluguel, assinaturas e outras recorrências para acompanhar o comprometido."
    >
      <template #row="{ item: bill }">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          :class="bill.type === 'income' ? 'bg-income-soft' : 'bg-expense-soft'"
        >
          {{ bill.type === 'income' ? '⬆️' : '⬇️' }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-ink">{{ bill.name }}</p>
            <span class="badge text-xs" :class="statusBadge(bill.status)">{{ statusLabel(bill.status) }}</span>
          </div>
          <p class="text-xs text-muted mt-0.5">Todo dia {{ bill.day_of_month }}</p>
        </div>

        <div class="text-right flex-shrink-0 flex items-center gap-3">
          <p class="text-sm font-bold" :class="bill.type === 'income' ? 'text-income' : 'text-expense'">
            {{ formatCurrency(bill.amount) }}
          </p>
          <DropdownMenu>
            <DropdownMenuItem @click="openEdit(bill)">✏️ Editar</DropdownMenuItem>
            <DropdownMenuItem
              v-if="bill.status === 'active'"
              @click="setStatus(bill, 'paused')"
            >
              ⏸️ Pausar
            </DropdownMenuItem>
            <DropdownMenuItem
              v-else-if="bill.status === 'paused'"
              @click="setStatus(bill, 'active')"
            >
              ▶️ Reativar
            </DropdownMenuItem>
            <DropdownMenuItem danger @click="confirmDelete(bill)">🗑️ Excluir</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </template>
    </DataTable>

    <RecurringBillFormModal v-model="modalOpen" :bill="editingBill" @saved="billsStore.fetchBills()" />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRecurringBillsStore } from '@/stores/recurringBills'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import DataTable from '@/components/ui/DataTable.vue'
  import DropdownMenu from '@/components/ui/DropdownMenu.vue'
  import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
  import RecurringBillFormModal from '@/components/recurring-bills/RecurringBillFormModal.vue'

  const billsStore = useRecurringBillsStore()
  const { success, error: notifyError } = useNotification()

  const modalOpen = ref(false)
  const editingBill = ref(null)

  const STATUS_LABELS = { active: 'Ativa', paused: 'Pausada', cancelled: 'Cancelada' }
  const STATUS_BADGES = { active: 'badge-income', paused: 'badge-warning', cancelled: 'badge-gray' }
  function statusLabel(status) {
    return STATUS_LABELS[status] ?? status
  }
  function statusBadge(status) {
    return STATUS_BADGES[status] ?? 'badge-gray'
  }

  function openCreate() {
    editingBill.value = null
    modalOpen.value = true
  }

  function openEdit(bill) {
    editingBill.value = bill
    modalOpen.value = true
  }

  async function setStatus(bill, status) {
    try {
      await billsStore.updateBill(bill.id, { status })
      success(status === 'active' ? 'Conta fixa reativada.' : 'Conta fixa pausada.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  async function confirmDelete(bill) {
    if (!confirm(`Excluir a conta fixa "${bill.name}"? Ocorrências já lançadas são mantidas.`)) return

    try {
      await billsStore.deleteBill(bill.id)
      success('Conta fixa excluída com sucesso.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(() => billsStore.fetchBills())
</script>
