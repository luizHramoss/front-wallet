<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md card">
              <div class="flex items-center justify-between mb-4">
                <DialogTitle class="text-lg font-semibold text-ink">{{ title }}</DialogTitle>
                <button
                  class="text-muted hover:text-ink text-lg leading-none"
                  @click="close"
                >
                  ×
                </button>
              </div>

              <slot />

              <div v-if="$slots.footer" class="flex items-center justify-end gap-2 mt-6">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
  import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

  defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
  })

  const emit = defineEmits(['update:modelValue'])

  function close() {
    emit('update:modelValue', false)
  }
</script>
