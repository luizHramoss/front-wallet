<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- Toast global -->
  <NotificationStack />
</template>

<script setup>
  import { RouterView } from 'vue-router'
  import NotificationStack from '@/components/ui/NotificationStack.vue'
</script>
