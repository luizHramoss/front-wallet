<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium"
          :class="typeClass(n.type)"
        >
          <span class="text-base flex-shrink-0 mt-0.5">{{ typeIcon(n.type) }}</span>
          <p class="flex-1 leading-snug">{{ n.message }}</p>
          <button
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none ml-1"
            @click="remove(n.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
  import { useNotification } from '@/composables/useNotification'

  const { notifications, remove } = useNotification()

  function typeClass(type) {
    return {
      success: 'bg-income-soft border-income/20 text-income',
      error:   'bg-danger-soft border-danger/20 text-danger',
      warning: 'bg-warning-soft border-warning/20 text-warning',
      info:    'bg-accent/10 border-accent/20 text-accent-strong',
    }[type] ?? 'bg-surface-alt border-border text-ink'
  }

  function typeIcon(type) {
    return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] ?? '💬'
  }
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
.toast-move         { transition: transform 0.3s ease; }
</style>
