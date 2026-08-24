<template>
  <ModalDialog v-model="isOpen" :title="isEditing ? 'Editar categoria' : 'Nova categoria'">
    <form novalidate @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Nome</label>
        <input v-model="form.name" type="text" class="input" placeholder="Ex: Alimentação" />
        <FieldError :message="errors.name" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Tipo</label>
        <div class="grid grid-cols-2 gap-2">
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
            @click="form.type = opt.value; form.parent_id = null"
          >
            {{ opt.label }}
          </button>
        </div>
        <FieldError :message="errors.type" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-ink mb-1.5">Categoria pai</label>
        <select v-model.number="form.parent_id" class="input">
          <option :value="null">Nenhuma (categoria principal)</option>
          <option v-for="cat in parentOptions" :key="cat.id" :value="cat.id">
            {{ cat.icon ? `${cat.icon} ` : '' }}{{ cat.name }}
          </option>
        </select>
        <FieldError :message="errors.parent_id" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-2">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Ícone</label>
          <input v-model="form.icon" type="text" class="input" placeholder="🍔" maxlength="4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Cor</label>
          <div class="flex flex-wrap gap-2 pt-2">
            <button
              v-for="c in colorSwatches"
              :key="c"
              type="button"
              class="w-6 h-6 rounded-full border-2 transition-transform"
              :style="{ backgroundColor: c }"
              :class="form.color === c ? 'border-ink scale-110' : 'border-transparent'"
              @click="form.color = c"
            />
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="spinner" />
        <span v-else>{{ isEditing ? 'Salvar' : 'Criar categoria' }}</span>
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { useCategoriesStore } from '@/stores/categories'
  import { useForm } from '@/composables/useForm'
  import { useNotification } from '@/composables/useNotification'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ModalDialog from '@/components/ui/ModalDialog.vue'
  import FieldError from '@/components/ui/FieldError.vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    category: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved'])

  const categoriesStore = useCategoriesStore()
  const { success, error: notifyError } = useNotification()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const isEditing = computed(() => !!props.category)

  const typeOptions = [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' },
  ]

  const colorSwatches = ['#0ea5e9', '#7c3aed', '#059669', '#dc2626', '#d97706', '#64748b']

  const { form, errors, loading, submit, setErrors, reset } = useForm({
    name: '',
    type: 'expense',
    parent_id: null,
    icon: '',
    color: colorSwatches[0],
  })

  // Só categorias do mesmo tipo, sem pai (evita duas gerações de nesting)
  // e nunca a própria categoria em edição.
  const parentOptions = computed(() =>
    categoriesStore.items.filter(
      (c) => c.type === form.type && !c.parent_id && c.id !== props.category?.id
    )
  )

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return

      if (props.category) {
        Object.assign(form, {
          name: props.category.name,
          type: props.category.type,
          parent_id: props.category.parent_id,
          icon: props.category.icon ?? '',
          color: props.category.color ?? colorSwatches[0],
        })
      } else {
        reset()
      }
    }
  )

  async function handleSubmit() {
    await submit(async () => {
      try {
        const payload = {
          name: form.name,
          type: form.type,
          parent_id: form.parent_id,
          icon: form.icon || null,
          color: form.color,
        }
        if (isEditing.value) {
          await categoriesStore.updateCategory(props.category.id, payload)
          success('Categoria atualizada com sucesso!')
        } else {
          await categoriesStore.createCategory(payload)
          success('Categoria criada com sucesso!')
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
