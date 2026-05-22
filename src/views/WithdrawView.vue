<template>
  <div class="max-w-lg">
    <!-- Header -->
    <div class="mb-6">
      <RouterLink
        :to="{ name: 'Dashboard' }"
        class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
      >
        ← Voltar
      </RouterLink>
      <h1 class="text-2xl font-bold text-gray-900">Sacar</h1>
      <p class="text-gray-500 text-sm mt-1">Retire saldo da sua carteira</p>
    </div>

    <!-- Saldo disponível -->
    <div
      class="card mb-6 flex items-center gap-4"
      :class="isBalanceLow ? 'border-amber-200 bg-amber-50' : ''"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        :class="isBalanceLow ? 'bg-amber-100' : 'bg-brand-100'"
      >
        {{ isBalanceLow ? '⚠️' : '💰' }}
      </div>
      <div>
        <p class="text-xs text-gray-500 font-medium">Saldo disponível</p>
        <p class="text-lg font-bold" :class="isBalanceLow ? 'text-amber-700' : 'text-gray-900'">
          <span v-if="walletStore.loading" class="inline-block w-24 h-5 bg-gray-100 rounded animate-pulse" />
          <span v-else>{{ formatCurrency(currentBalance) }}</span>
        </p>
        <p v-if="isBalanceLow && currentBalance > 0" class="text-xs text-amber-600 mt-0.5">
          Saldo baixo
        </p>
        <p v-if="currentBalance === 0" class="text-xs text-red-600 mt-0.5">
          Saldo insuficiente para saques
        </p>
      </div>
    </div>

    <!-- Formulário -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-5">Valor do saque</h2>

      <!-- Atalhos -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="v in availableQuickValues"
          :key="v"
          type="button"
          class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
          :class="
            amount === String(v)
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
          "
          @click="setQuickValue(v)"
        >
          {{ formatCurrency(v) }}
        </button>
        <button
          v-if="currentBalance > 0"
          type="button"
          class="px-3 py-1.5 rounded-lg border text-sm font-medium border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
          @click="setQuickValue(currentBalance)"
        >
          Tudo ({{ formatCurrency(currentBalance) }})
        </button>
      </div>

      <ErrorAlert :message="serverError" class="mb-4" />

      <form novalidate @submit.prevent="handleSubmit">
        <AmountInput
          v-model="amount"
          label="Valor"
          id="withdraw-amount"
          :error="amountError"
          :hint="balanceHint"
          :disabled="loading || currentBalance === 0"
          @blur="validateField"
        />

        <!-- Preview do saldo restante -->
        <Transition name="fade">
          <div
            v-if="remainingBalance !== null && !amountError && amount"
            class="mt-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm"
          >
            <span class="text-gray-500">Saldo após saque:</span>
            <span
              class="font-semibold"
              :class="remainingBalance >= 0 ? 'text-gray-900' : 'text-red-600'"
            >
              {{ formatCurrency(remainingBalance) }}
            </span>
          </div>
        </Transition>

        <button
          type="submit"
          class="btn-danger btn-lg w-full mt-6"
          :disabled="loading || !!amountError || currentBalance === 0"
        >
          <span v-if="loading" class="spinner" />
          <span v-else>⬇️ Confirmar saque</span>
        </button>
      </form>
    </div>

    <!-- Success feedback -->
    <Transition name="slide-up">
      <div
        v-if="lastTransaction"
        class="card mt-4 border-blue-200 bg-blue-50"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <p class="font-semibold text-blue-800">Saque realizado!</p>
            <p class="text-sm text-blue-700">
              {{ formatCurrency(lastTransaction.amount) }} sacado •
              Saldo restante: {{ formatCurrency(lastTransaction.balance_after) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useWalletStore } from '@/stores/wallet'
  import { validateAmount } from '@/validations/transaction'
  import { formatCurrency, getErrorMessage } from '@/utils/currency'
  import { useNotification } from '@/composables/useNotification'
  import AmountInput from '@/components/forms/AmountInput.vue'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'

  const walletStore = useWalletStore()
  const { success, error: notifyError } = useNotification()

  const amount = ref('')
  const amountError = ref('')
  const serverError = ref('')
  const loading = ref(false)
  const lastTransaction = ref(null)

  const currentBalance = computed(() => Number(walletStore.balance ?? 0))
  const isBalanceLow = computed(() => currentBalance.value < 50)

  const balanceHint = computed(() =>
    currentBalance.value > 0
      ? `Saldo disponível: ${formatCurrency(currentBalance.value)}`
      : 'Sem saldo disponível'
  )

  const availableQuickValues = computed(() =>
    [50, 100, 200, 500].filter((v) => v <= currentBalance.value)
  )

  const remainingBalance = computed(() => {
    const num = parseFloat(amount.value)
    if (isNaN(num) || num <= 0) return null
    return currentBalance.value - num
  })

  function setQuickValue(v) {
    amount.value = String(v)
    validateField()
  }

  function validateField() {
    const { valid, error } = validateAmount(amount.value, currentBalance.value)
    amountError.value = valid ? '' : error
  }

  async function handleSubmit() {
    validateField()
    if (amountError.value) return

    serverError.value = ''
    lastTransaction.value = null
    loading.value = true

    try {
      const tx = await walletStore.withdraw(parseFloat(amount.value))
      lastTransaction.value = tx
      success(`Saque de ${formatCurrency(tx.amount)} realizado com sucesso!`)
      amount.value = ''
    } catch (e) {
      serverError.value = getErrorMessage(e)
      notifyError(getErrorMessage(e))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (walletStore.balance === null) walletStore.fetchBalance()
  })
</script>
