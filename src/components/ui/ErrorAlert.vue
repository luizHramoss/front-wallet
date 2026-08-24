<template>
  <div
    v-if="message"
    class="flex items-start gap-3 bg-danger-soft border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm"
    role="alert"
  >
    <span class="flex-shrink-0 mt-0.5">❌</span>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
  defineProps({ message: { type: String, default: '' } })
</script>
