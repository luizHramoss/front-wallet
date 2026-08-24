<template>
  <ModalDialog v-model="isOpen" :title="isEditing ? 'Editar conta' : 'Nova conta'">
    <form novalidate @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Nome</label>
        <input v-model="form.name" type="text" class="input" placeholder="Ex: Nubank, Carteira, Poupança" />
        <FieldError :message="errors.name" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Tipo</label>
        <select v-model="form.type" class="input">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.icon }} {{ opt.label }}
          </option>
        </select>
        <FieldError :message="errors.type" />
      </div>

      <div v-if="!isEditing" class="mb-4">
        <AmountInput v-model="form.balance" label="Saldo inicial" id="account-balance" :error="errors.balance" hint="Opcional, padrão R$ 0,00" />
      </div>

      <div class="mb-2">
        <label class="block text-sm font-medium text-ink mb-1.5">Cor</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in colorSwatches"
            :key="c"
            type="button"
            class="w-7 h-7 rounded-full border-2 transition-transform"
            :style="{ backgroundColor: c }"
            :class="form.color === c ? 'border-ink scale-110' : 'border-transparent'"
            @click="form.color = c"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>{{ isEditing ? 'Salvar' : 'Criar conta' }}</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useAccountsStore } from '@/stores/accounts'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'
  import AmountInput from '@/components/forms/AmountInput.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    account: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const accountsStore = useAccountsStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const isEditing = computed(() => !!props.account)

  const typeOptions = [
    { value: 'checking', label: 'Conta corrente', icon: '🏦' },
    { value: 'savings', label: 'Poupança', icon: '🐷' },
    { value: 'cash', label: 'Dinheiro', icon: '💵' },
    { value: 'investment', label: 'Investimento', icon: '📈' },
  ]

  const colorSwatches = ['#0ea5e9', '#7c3aed', '#059669', '#dc2626', '#d97706', '#64748b']

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    name: '',
    type: 'checking',
    balance: '0',
    color: colorSwatches[0],
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return

      if (props.account) {
        Object.assign(form, {
          name: props.account.name,
          type: props.account.type,
          color: props.account.color ?? colorSwatches[0],
        })
      } else {
        reset()
      }
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        if (isEditing.value) {
          await accountsStore.updateAccount(props.account.id, {
            name: form.name,
            type: form.type,
            color: form.color,
          })
          success('Conta atualizada com sucesso!')
        } else {
          await accountsStore.createAccount({
            name: form.name,
            type: form.type,
            balance: parseFloat(form.balance || 0),
            color: form.color,
          })
          success('Conta criada com sucesso!')
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
