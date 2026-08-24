<template>
  <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between mt-5">
    <p class="text-sm text-muted">
      Mostrando {{ showingFrom }}–{{ showingTo }} de {{ meta.total }}
    </p>

    <div class="flex items-center gap-1">
      <button
        class="btn-secondary btn-sm"
        :disabled="meta.current_page === 1 || loading"
        @click="$emit('update:page', meta.current_page - 1)"
      >
        ←
      </button>

      <button
        v-for="p in visiblePages"
        :key="p"
        class="btn-sm min-w-[36px]"
        :class="p === meta.current_page ? 'btn-primary' : 'btn-secondary'"
        @click="$emit('update:page', p)"
      >
        {{ p }}
      </button>

      <button
        class="btn-secondary btn-sm"
        :disabled="meta.current_page === meta.last_page || loading"
        @click="$emit('update:page', meta.current_page + 1)"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    meta: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  })

  defineEmits(['update:page'])

  const showingFrom = computed(() => {
    if (!props.meta) return 0
    return (props.meta.current_page - 1) * props.meta.per_page + 1
  })

  const showingTo = computed(() => {
    if (!props.meta) return 0
    return Math.min(props.meta.current_page * props.meta.per_page, props.meta.total)
  })

  const visiblePages = computed(() => {
    if (!props.meta) return []
    const last = props.meta.last_page
    const cur = props.meta.current_page
    const delta = 2
    const pages = []
    for (let i = Math.max(1, cur - delta); i <= Math.min(last, cur + delta); i++) {
      pages.push(i)
    }
    return pages
  })
</script>
