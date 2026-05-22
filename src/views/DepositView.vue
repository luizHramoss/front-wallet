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
      <h1 class="text-2xl font-bold text-gray-900">Depositar</h1>
      <p class="text-gray-500 text-sm mt-1">Adicione saldo à sua carteira</p>
    </div>

    <!-- Saldo atual -->
    <div class="card mb-6 flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-lg">💰</div>
      <div>
        <p class="text-xs text-gray-500 font-medium">Saldo atual</p>
        <p class="text-lg font-bold text-gray-900">
          <span v-if="walletStore.loading" class="inline-block w-24 h-5 bg-gray-100 rounded animate-pulse" />
          <span v-else>{{ formatCurrency(walletStore.balance ?? 0) }}</span>
        </p>
      </div>
    </div>

    <!-- Formulário -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-5">Valor do depósito</h2>

      <!-- Atalhos de valor rápido -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="v in quickValues"
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
      </div>

      <ErrorAlert :message="serverError" class="mb-4" />

      <form novalidate @submit.prevent="handleSubmit">
        <AmountInput
          v-model="amount"
          label="Valor"
          id="deposit-amount"
          :error="amountError"
          hint="Valor mínimo: R$ 0,01"
          :disabled="loading"
          @blur="validateField"
        />

        <button
          type="submit"
          class="btn-success btn-lg w-full mt-6"
          :disabled="loading || !!amountError"
        >
          <span v-if="loading" class="spinner" />
          <span v-else>⬆️ Confirmar depósito</span>
        </button>
      </form>
    </div>

    <!-- Success feedback -->
    <Transition name="slide-up">
      <div
        v-if="lastTransaction"
        class="card mt-4 border-emerald-200 bg-emerald-50"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <p class="font-semibold text-emerald-800">Depósito realizado!</p>
            <p class="text-sm text-emerald-700">
              {{ formatCurrency(lastTransaction.amount) }} adicionado •
              Novo saldo: {{ formatCurrency(lastTransaction.balance_after) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
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

  const quickValues = [50, 100, 200, 500, 1000]

  function setQuickValue(v) {
    amount.value = String(v)
    amountError.value = ''
  }

  function validateField() {
    const { valid, error } = validateAmount(amount.value)
    amountError.value = valid ? '' : error
  }

  async function handleSubmit() {
    validateField()
    if (amountError.value) return

    serverError.value = ''
    lastTransaction.value = null
    loading.value = true

    try {
      const tx = await walletStore.deposit(parseFloat(amount.value))
      lastTransaction.value = tx
      success(`Depósito de ${formatCurrency(tx.amount)} realizado com sucesso!`)
      amount.value = ''
    } catch (e) {
      serverError.value = getErrorMessage(e)
      notifyError(getErrorMessage(e))
    } finally {
      loading.value = false
    }
  }
</script>
