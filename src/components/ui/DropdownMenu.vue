<template>
  <Menu as="div" class="relative inline-block text-left">
    <MenuButton class="p-1.5 rounded-lg text-muted hover:bg-surface-alt hover:text-ink transition-colors">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </MenuButton>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-xl bg-surface border border-border shadow-lg py-1 focus:outline-none"
      >
        <slot />
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup>
  import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
</script>
