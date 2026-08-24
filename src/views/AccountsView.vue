<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Contas</h1>
        <p class="text-muted text-sm mt-1">Saldo total: {{ formatCurrency(accountsStore.totalBalance) }}</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate">+ Nova conta</button>
    </div>

    <ErrorAlert v-if="accountsStore.error" :message="getErrorMessage(accountsStore.error)" class="mb-4" />

    <!-- Loading skeleton -->
    <div v-if="accountsStore.loading && !accountsStore.items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="card animate-pulse h-32" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="!accountsStore.activeAccounts.length"
      icon="🏦"
      title="Nenhuma conta ainda"
      description="Crie sua primeira conta para começar a organizar suas finanças."
      class="py-20"
    >
      <button class="mt-4 btn-primary btn-sm" @click="openCreate">+ Nova conta</button>
    </EmptyState>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="acc in accountsStore.activeAccounts" :key="acc.id" class="card-hover">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              :style="{ backgroundColor: (acc.color ?? '#0ea5e9') + '20' }"
            >
              {{ typeIcon(acc.type) }}
            </div>
            <div>
              <p class="font-semibold text-ink">{{ acc.name }}</p>
              <p class="text-xs text-muted">{{ typeLabel(acc.type) }}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuItem @click="openEdit(acc)">✏️ Editar</DropdownMenuItem>
            <DropdownMenuItem danger @click="confirmArchive(acc)">🗄️ Arquivar</DropdownMenuItem>
          </DropdownMenu>
        </div>

        <p class="text-2xl font-bold text-ink mb-3">{{ formatCurrency(acc.balance) }}</p>

        <RouterLink
          :to="{ name: 'Transactions', query: { account_id: acc.id } }"
          class="text-xs text-accent hover:text-accent-strong font-medium"
        >
          Ver transações →
        </RouterLink>
      </div>
    </div>

    <!-- Arquivadas -->
    <div v-if="accountsStore.archivedAccounts.length" class="mt-8">
      <h2 class="text-sm font-semibold text-muted mb-3">Contas arquivadas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="acc in accountsStore.archivedAccounts" :key="acc.id" class="card opacity-60">
          <p class="font-medium text-ink">{{ acc.name }}</p>
          <p class="text-sm text-muted">{{ formatCurrency(acc.balance) }}</p>
        </div>
      </div>
    </div>

    <AccountFormModal v-model="modalOpen" :account="editingAccount" @saved="accountsStore.fetchAccounts()" />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useAccountsStore } from '@/stores/accounts'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import EmptyState from '@/components/ui/EmptyState.vue'
  import DropdownMenu from '@/components/ui/DropdownMenu.vue'
  import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
  import AccountFormModal from '@/components/accounts/AccountFormModal.vue'

  const accountsStore = useAccountsStore()
  const { success, error: notifyError } = useNotification()

  const modalOpen = ref(false)
  const editingAccount = ref(null)

  const TYPE_LABELS = { checking: 'Conta corrente', savings: 'Poupança', cash: 'Dinheiro', investment: 'Investimento' }
  const TYPE_ICONS = { checking: '🏦', savings: '🐷', cash: '💵', investment: '📈' }
  function typeLabel(type) {
    return TYPE_LABELS[type] ?? type
  }
  function typeIcon(type) {
    return TYPE_ICONS[type] ?? '💳'
  }

  function openCreate() {
    editingAccount.value = null
    modalOpen.value = true
  }

  function openEdit(account) {
    editingAccount.value = account
    modalOpen.value = true
  }

  async function confirmArchive(account) {
    if (!confirm(`Arquivar a conta "${account.name}"? O histórico de transações é mantido.`)) return

    try {
      await accountsStore.archiveAccount(account.id)
      success('Conta arquivada com sucesso.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(() => accountsStore.fetchAccounts())
</script>
