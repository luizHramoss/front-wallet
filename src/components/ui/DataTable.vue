<template>
  <div class="card p-0 overflow-hidden">
    <!-- Loading skeleton -->
    <div v-if="loading && !items.length" class="divide-y divide-border">
      <div
        v-for="i in skeletonRows"
        :key="i"
        class="flex items-center gap-4 px-6 py-4 animate-pulse"
      >
        <div class="w-9 h-9 rounded-full bg-surface-alt flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3.5 bg-surface-alt rounded w-20" />
          <div class="h-3 bg-surface-alt rounded w-32" />
        </div>
        <div class="space-y-2 text-right">
          <div class="h-3.5 bg-surface-alt rounded w-24 ml-auto" />
          <div class="h-3 bg-surface-alt rounded w-16 ml-auto" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="!items.length"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
      class="py-20"
    >
      <slot name="empty-action" />
    </EmptyState>

    <!-- Rows -->
    <ul v-else class="divide-y divide-border">
      <TransitionGroup name="fade">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt transition-colors"
        >
          <slot name="row" :item="item" />
        </li>
      </TransitionGroup>
    </ul>
  </div>
</template>

<script setup>
  import EmptyState from '@/components/ui/EmptyState.vue'

  defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    skeletonRows: { type: Number, default: 5 },
    emptyIcon: { type: String, default: '📋' },
    emptyTitle: { type: String, default: 'Nada encontrado' },
    emptyDescription: { type: String, default: '' },
  })
</script>
