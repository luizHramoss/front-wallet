<template>
  <div :class="['flex items-center justify-center', fullPage ? 'min-h-[300px]' : '']">
    <div class="flex flex-col items-center gap-3">
      <div
        :class="['spinner', sizeClass]"
        :style="{ borderColor: `${color} transparent ${color} ${color}` }"
      />
      <p v-if="label" class="text-sm text-gray-500">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    size:     { type: String, default: 'md' },   // sm | md | lg
    color:    { type: String, default: '#0284c7' },
    label:    { type: String, default: '' },
    fullPage: { type: Boolean, default: false },
  })

  const sizeClass = computed(() => ({
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[props.size] ?? 'w-6 h-6'))
</script>
