<template>
  <Transition name="fade">
    <p v-if="message" class="mt-1 text-xs text-danger flex items-center gap-1">
      <span>⚠</span> {{ message }}
    </p>
  </Transition>
</template>

<script setup>
  defineProps({ message: { type: String, default: '' } })
</script>
