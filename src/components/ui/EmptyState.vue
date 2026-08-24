<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <span class="text-5xl mb-4">{{ icon }}</span>
    <h3 class="text-base font-semibold text-ink mb-1">{{ title }}</h3>
    <p class="text-sm text-muted max-w-xs">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
  defineProps({
    icon:        { type: String, default: '📭' },
    title:       { type: String, default: 'Nenhum dado encontrado' },
    description: { type: String, default: '' },
  })
</script>
