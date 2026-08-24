<template>
  <li>
    <div class="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-surface-alt group">
      <span class="text-sm text-ink flex items-center gap-2">
        <span v-if="category.icon">{{ category.icon }}</span>
        {{ category.name }}
      </span>
      <span class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="text-xs text-muted hover:text-ink px-1.5" @click="$emit('edit', category)">✏️</button>
        <button class="text-xs text-muted hover:text-danger px-1.5" @click="$emit('delete', category)">🗑️</button>
      </span>
    </div>

    <ul v-if="category.children?.length" class="ml-5 border-l border-border pl-2 space-y-1">
      <!-- self-referencing recursion: Vue 3.3+ SFCs can refer to their own filename as a tag -->
      <CategoryRow
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </ul>
  </li>
</template>

<script setup>
  defineProps({ category: { type: Object, required: true } })
  defineEmits(['edit', 'delete'])
</script>
