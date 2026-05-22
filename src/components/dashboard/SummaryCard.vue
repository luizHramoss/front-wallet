<template>
  <div class="card flex items-center gap-4">
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
      :class="iconBg"
    >
      {{ icon }}
    </div>
    <div class="min-w-0">
      <p class="text-xs text-gray-500 font-medium mb-0.5">{{ label }}</p>
      <div v-if="loading" class="h-6 w-28 bg-gray-100 rounded animate-pulse" />
      <p v-else class="text-xl font-bold" :class="valueColor">
        {{ formatCurrency(value ?? 0) }}
      </p>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
  import { formatCurrency } from '@/utils/currency'

  defineProps({
    icon:      { type: String, required: true },
    label:     { type: String, required: true },
    value:     { type: Number, default: null },
    subtitle:  { type: String, default: '' },
    iconBg:    { type: String, default: 'bg-gray-100' },
    valueColor:{ type: String, default: 'text-gray-900' },
    loading:   { type: Boolean, default: false },
  })
</script>
