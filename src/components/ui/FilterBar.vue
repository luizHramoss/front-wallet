<template>
  <div class="card mb-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <slot />
    </div>

    <div
      v-if="$slots.badges && hasActiveFilters"
      class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border"
    >
      <slot name="badges" />
    </div>
  </div>
</template>

<script setup>
  defineProps({
    hasActiveFilters: { type: Boolean, default: false },
  })
</script>
