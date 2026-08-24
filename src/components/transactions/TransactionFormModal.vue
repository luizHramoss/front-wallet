<template>
  <ModalDialog v-model="isOpen" :title="isEditing ? 'Editar transação' : 'Nova transação'">
    <form novalidate @submit.prevent="handleSubmit">
      <!-- Tipo (só na criação - editar tipo é ambíguo demais, backend não permite) -->
      <div v-if="!isEditing" class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Tipo</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            type="button"
            class="px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
            :class="
              form.type === opt.value
                ? 'border-accent bg-accent/10 text-accent-strong'
                : 'border-border text-muted hover:border-accent/40'
            "
            @click="form.type = opt.value"
          >
            {{ opt.icon }} {{ opt.label }}
          </button>
        </div>
      </div>
      <div v-else class="mb-4">
        <span class="badge text-xs" :class="typeMeta(form.type).badge">
          {{ typeMeta(form.type).label }}
        </span>
      </div>

      <!-- Conta -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">
          {{ form.type === 'transfer' ? 'Conta de origem' : 'Conta' }}
        </label>
        <select v-model.number="form.account_id" class="input" :disabled="isEditing">
          <option v-for="acc in accountsStore.activeAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }} · {{ formatCurrency(acc.balance) }}
          </option>
        </select>
        <FieldError :message="errors.account_id" />
      </div>

      <!-- Conta destino (transfer) -->
      <div v-if="form.type === 'transfer'" class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Conta de destino</label>
        <select v-model.number="form.to_account_id" class="input">
          <option value="" disabled>Selecione...</option>
          <option
            v-for="acc in destinationAccounts"
            :key="acc.id"
            :value="acc.id"
          >
            {{ acc.name }} · {{ formatCurrency(acc.balance) }}
          </option>
        </select>
        <FieldError :message="errors.to_account_id" />
      </div>

      <!-- Categoria -->
      <div v-if="form.type !== 'transfer'" class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Categoria</label>
        <select v-model.number="form.category_id" class="input">
          <option :value="null">Sem categoria</option>
          <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
            {{ cat.icon ? `${cat.icon} ` : '' }}{{ cat.name }}
          </option>
        </select>
        <FieldError :message="errors.category_id" />
      </div>

      <!-- Valor -->
      <AmountInput v-model="form.amount" label="Valor" id="tx-amount" :error="errors.amount" class="mb-4" />

      <!-- Descrição -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Descrição</label>
        <input v-model="form.description" type="text" class="input" placeholder="Opcional" />
        <FieldError :message="errors.description" />
      </div>

      <!-- Data + status -->
      <div class="grid grid-cols-2 gap-4 mb-2">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Data</label>
          <input v-model="form.occurred_at" type="date" class="input" />
          <FieldError :message="errors.occurred_at" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Status</label>
          <select v-model="form.status" class="input">
            <option value="realized">Realizada</option>
            <option value="planned">Prevista</option>
          </select>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>{{ isEditing ? 'Salvar' : 'Criar transação' }}</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useTransactionsStore } from '@/stores/transactions'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'
  import AmountInput from '@/components/forms/AmountInput.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    transaction: { type: Object, default: null },
    defaultType: { type: String, default: 'expense' },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const txStore = useTransactionsStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const isEditing = computed(() => !!props.transaction)

  const typeOptions = [
    { value: 'income', label: 'Receita', icon: '⬆️' },
    { value: 'expense', label: 'Despesa', icon: '⬇️' },
    { value: 'transfer', label: 'Transferência', icon: '↔️' },
  ]

  const TYPE_META = {
    income: { label: 'Receita', badge: 'badge-income' },
    expense: { label: 'Despesa', badge: 'badge-expense' },
    transfer: { label: 'Transferência', badge: 'badge-transfer' },
  }
  function typeMeta(type) {
    return TYPE_META[type] ?? TYPE_META.expense
  }

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    account_id: null,
    to_account_id: '',
    category_id: null,
    type: 'expense',
    amount: '',
    description: '',
    occurred_at: today(),
    status: 'realized',
  })

  const destinationAccounts = computed(() =>
    accountsStore.activeAccounts.filter((a) => a.id !== form.account_id)
  )

  const categoryOptions = computed(() =>
    categoriesStore.items.filter((c) => c.type === form.type)
  )

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return

      if (props.transaction) {
        const t = props.transaction
        Object.assign(form, {
          account_id: t.account_id,
          to_account_id: '',
          category_id: t.category_id,
          type: t.type,
          amount: t.amount,
          description: t.description ?? '',
          occurred_at: t.occurred_at,
          status: t.status,
        })
      } else {
        reset()
        form.account_id = accountsStore.activeAccounts[0]?.id ?? null
        form.occurred_at = today()
        form.type = props.defaultType
      }
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        if (isEditing.value) {
          await txStore.updateTransaction(props.transaction.id, {
            category_id: form.category_id,
            amount: parseFloat(form.amount),
            description: form.description || null,
            occurred_at: form.occurred_at,
            status: form.status,
          })
          success('Transação atualizada com sucesso!')
        } else {
          const payload = {
            account_id: form.account_id,
            category_id: form.category_id,
            type: form.type,
            amount: parseFloat(form.amount),
            description: form.description || null,
            occurred_at: form.occurred_at,
            status: form.status,
          }
          if (form.type === 'transfer') {
            payload.to_account_id = form.to_account_id
          }
          await txStore.createTransaction(payload)
          success('Transação criada com sucesso!')
        }
        emit('saved')
        isOpen.value = false
      } catch (e) {
        setErrors(getFieldErrors(e))
        notifyError(getErrorMessage(e))
      }
    })
  }
</script>
