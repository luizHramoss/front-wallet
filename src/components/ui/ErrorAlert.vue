<template>
  <div
    v-if="message"
    class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
    role="alert"
  >
    <span class="flex-shrink-0 mt-0.5">❌</span>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
  defineProps({ message: { type: String, default: '' } })
</script>
