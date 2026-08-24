<template>
  <ModalDialog v-model="isOpen" :title="`Novo movimento — ${investment?.name ?? ''}`">
    <form novalidate @submit.prevent="handleSubmit">
      <div class="mb-4">
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

      <template v-if="form.type !== 'dividend'">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Quantidade</label>
            <input v-model="form.quantity" type="number" step="0.00000001" min="0" class="input" />
            <FieldError :message="errors.quantity" />
          </div>
          <div>
            <AmountInput v-model="form.price" label="Preço unitário" id="movement-price" :error="errors.price" />
          </div>
        </div>
        <p class="text-sm text-muted mb-4">
          Total: <span class="font-semibold text-ink">{{ formatCurrency(totalAmount) }}</span>
        </p>
      </template>

      <template v-else>
        <div class="mb-4">
          <AmountInput v-model="form.amount" label="Valor recebido" id="movement-amount" :error="errors.amount" />
        </div>
      </template>

      <div class="mb-2">
        <label class="block text-sm font-medium text-ink mb-1.5">Data</label>
        <input v-model="form.occurred_at" type="date" class="input" />
        <FieldError :message="errors.occurred_at" />
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>Registrar</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useInvestmentsStore } from '@/stores/investments'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { formatCurrency, getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'
  import AmountInput from '@/components/forms/AmountInput.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    investment: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const investmentsStore = useInvestmentsStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const typeOptions = [
    { value: 'buy', label: 'Compra', icon: '🛒' },
    { value: 'sell', label: 'Venda', icon: '💸' },
    { value: 'dividend', label: 'Dividendo', icon: '💰' },
  ]

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    type: 'buy',
    quantity: '',
    price: '',
    amount: '',
    occurred_at: today(),
  })

  const totalAmount = computed(() => {
    const q = parseFloat(form.quantity)
    const p = parseFloat(form.price)
    return isNaN(q) || isNaN(p) ? 0 : q * p
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return
      reset()
      form.occurred_at = today()
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        const payload = { type: form.type, occurred_at: form.occurred_at }
        if (form.type === 'dividend') {
          payload.amount = parseFloat(form.amount)
        } else {
          payload.quantity = parseFloat(form.quantity)
          payload.price = parseFloat(form.price)
        }

        await investmentsStore.recordMovement(props.investment.id, payload)
        success('Movimento registrado com sucesso!')
        emit('saved')
        isOpen.value = false
      } catch (e) {
        setErrors(getFieldErrors(e))
        notifyError(getErrorMessage(e))
      }
    })
  }
</script>
