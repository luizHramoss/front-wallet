<template>
  <ModalDialog v-model="isOpen" :title="isEditing ? 'Editar conta fixa' : 'Nova conta fixa'">
    <form novalidate @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Nome</label>
        <input v-model="form.name" type="text" class="input" placeholder="Ex: Aluguel, Internet, Academia" />
        <FieldError :message="errors.name" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Tipo</label>
          <select v-model="form.type" class="input">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div>
          <AmountInput v-model="form.amount" label="Valor" id="bill-amount" :error="errors.amount" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Conta</label>
        <select v-model.number="form.account_id" class="input">
          <option v-for="acc in accountsStore.activeAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
        <FieldError :message="errors.account_id" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Categoria</label>
        <select v-model.number="form.category_id" class="input">
          <option :value="null">Sem categoria</option>
          <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
            {{ cat.icon ? `${cat.icon} ` : '' }}{{ cat.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Dia do vencimento</label>
          <input v-model.number="form.day_of_month" type="number" min="1" max="31" class="input" />
          <FieldError :message="errors.day_of_month" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Status</label>
          <select v-model="form.status" class="input">
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-2">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Início</label>
          <input v-model="form.start_date" type="date" class="input" />
          <FieldError :message="errors.start_date" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Término</label>
          <input v-model="form.end_date" type="date" class="input" />
          <p class="mt-1 text-xs text-muted">Opcional</p>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>{{ isEditing ? 'Salvar' : 'Criar conta fixa' }}</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { useRecurringBillsStore } from '@/stores/recurringBills'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'
  import AmountInput from '@/components/forms/AmountInput.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    bill: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const billsStore = useRecurringBillsStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const isEditing = computed(() => !!props.bill)

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    account_id: null,
    category_id: null,
    name: '',
    type: 'expense',
    amount: '',
    day_of_month: 5,
    start_date: today(),
    end_date: '',
    status: 'active',
  })

  const categoryOptions = computed(() =>
    categoriesStore.items.filter((c) => c.type === form.type)
  )

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return

      if (props.bill) {
        Object.assign(form, {
          account_id: props.bill.account_id,
          category_id: props.bill.category_id,
          name: props.bill.name,
          type: props.bill.type,
          amount: props.bill.amount,
          day_of_month: props.bill.day_of_month,
          start_date: props.bill.start_date,
          end_date: props.bill.end_date ?? '',
          status: props.bill.status,
        })
      } else {
        reset()
        form.account_id = accountsStore.activeAccounts[0]?.id ?? null
        form.start_date = today()
      }
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        const payload = {
          account_id: form.account_id,
          category_id: form.category_id,
          name: form.name,
          type: form.type,
          amount: parseFloat(form.amount),
          day_of_month: form.day_of_month,
          start_date: form.start_date,
          end_date: form.end_date || null,
          status: form.status,
        }
        if (isEditing.value) {
          await billsStore.updateBill(props.bill.id, payload)
          success('Conta fixa atualizada com sucesso!')
        } else {
          await billsStore.createBill(payload)
          success('Conta fixa criada com sucesso!')
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
