<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
    </label>
    <div class="relative">
      <span
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none"
      >
        R$
      </span>
      <input
        :id="id"
        v-model="inputValue"
        type="number"
        step="0.01"
        min="0.01"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input pl-9 pr-4 text-right text-lg font-semibold"
        :class="{ 'input-error': !!error }"
        @input="onInput"
        @blur="onBlur"
      />
    </div>
    <FieldError :message="error" />
    <p v-if="hint && !error" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import FieldError from '@/components/ui/FieldError.vue'

  const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    label:      { type: String, default: '' },
    id:         { type: String, default: 'amount' },
    placeholder:{ type: String, default: '0,00' },
    error:      { type: String, default: '' },
    hint:       { type: String, default: '' },
    disabled:   { type: Boolean, default: false },
  })

  const emit = defineEmits(['update:modelValue', 'blur'])

  const inputValue = ref(props.modelValue)

  watch(() => props.modelValue, (v) => { inputValue.value = v })

  function onInput(e) {
    emit('update:modelValue', e.target.value)
  }

  function onBlur() {
    emit('blur')
  }
</script>
