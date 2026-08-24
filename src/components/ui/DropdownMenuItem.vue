<template>
  <MenuItem v-slot="{ active }">
    <button
      type="button"
      class="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
      :class="[
        danger ? 'text-danger' : 'text-ink',
        active ? 'bg-surface-alt' : '',
      ]"
      @click="$emit('click')"
    >
      <slot />
    </button>
  </MenuItem>
</template>

<script setup>
  import { MenuItem } from '@headlessui/vue'

  defineProps({
    danger: { type: Boolean, default: false },
  })

  defineEmits(['click'])
</script>
