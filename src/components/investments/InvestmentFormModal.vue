<template>
  <ModalDialog v-model="isOpen" :title="isEditing ? 'Editar ativo' : 'Novo ativo'">
    <form novalidate @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Nome</label>
        <input v-model="form.name" type="text" class="input" placeholder="Ex: Tesouro Selic, Petrobras PN, Bitcoin" />
        <FieldError :message="errors.name" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Tipo</label>
          <select v-model="form.type" class="input">
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <FieldError :message="errors.type" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Código/ticker</label>
          <input v-model="form.symbol" type="text" class="input" placeholder="Ex: PETR4 (opcional)" />
        </div>
      </div>

      <div v-if="!isEditing" class="mb-2">
        <label class="block text-sm font-medium text-ink mb-1.5">Conta</label>
        <select v-model.number="form.account_id" class="input">
          <option v-for="acc in accountsStore.activeAccounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
        </select>
        <FieldError :message="errors.account_id" />
        <p class="mt-1 text-xs text-muted">
          Depois de criar, registre a primeira compra pra formar a posição.
        </p>
      </div>

      <div v-else class="mb-2">
        <label class="block text-sm font-medium text-ink mb-1.5">Preço atual (cotação manual)</label>
        <AmountInput v-model="form.current_price" id="investment-current-price" :error="errors.current_price" hint="Usado pra calcular o valor de mercado e a rentabilidade" />
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>{{ isEditing ? 'Salvar' : 'Criar ativo' }}</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useAccountsStore } from '@/stores/accounts'
  import { useInvestmentsStore } from '@/stores/investments'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'
  import AmountInput from '@/components/forms/AmountInput.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    investment: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const accountsStore = useAccountsStore()
  const investmentsStore = useInvestmentsStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const isEditing = computed(() => !!props.investment)

  const typeOptions = [
    { value: 'stock', label: 'Ação' },
    { value: 'fixed_income', label: 'Renda fixa' },
    { value: 'fund', label: 'Fundo' },
    { value: 'crypto', label: 'Cripto' },
    { value: 'other', label: 'Outro' },
  ]

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    account_id: null,
    name: '',
    symbol: '',
    type: 'stock',
    current_price: '',
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return

      if (props.investment) {
        Object.assign(form, {
          name: props.investment.name,
          symbol: props.investment.symbol ?? '',
          type: props.investment.type,
          current_price: props.investment.current_price ?? '',
        })
      } else {
        reset()
        form.account_id = accountsStore.activeAccounts[0]?.id ?? null
      }
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        if (isEditing.value) {
          await investmentsStore.updateInvestment(props.investment.id, {
            name: form.name,
            symbol: form.symbol || null,
            type: form.type,
            current_price: form.current_price === '' ? null : parseFloat(form.current_price),
          })
          success('Ativo atualizado com sucesso!')
        } else {
          await investmentsStore.createInvestment({
            account_id: form.account_id,
            name: form.name,
            symbol: form.symbol || null,
            type: form.type,
          })
          success('Ativo criado! Agora registre a primeira compra.')
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
