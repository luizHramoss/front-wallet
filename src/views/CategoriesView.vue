<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-ink">Categorias</h1>
        <p class="text-muted text-sm mt-1">Organize suas receitas e despesas</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate()">+ Nova categoria</button>
    </div>

    <ErrorAlert v-if="categoriesStore.error" :message="getErrorMessage(categoriesStore.error)" class="mb-4" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Receitas -->
      <div class="card">
        <h2 class="font-semibold text-income mb-4 flex items-center gap-2">⬆️ Receitas</h2>
        <EmptyState
          v-if="!incomeTree.length"
          icon="📂"
          title="Nenhuma categoria"
          description="Crie categorias de receita para organizar seus lançamentos."
        />
        <ul v-else class="space-y-1">
          <CategoryRow
            v-for="cat in incomeTree"
            :key="cat.id"
            :category="cat"
            @edit="openEdit"
            @delete="confirmDelete"
          />
        </ul>
      </div>

      <!-- Despesas -->
      <div class="card">
        <h2 class="font-semibold text-expense mb-4 flex items-center gap-2">⬇️ Despesas</h2>
        <EmptyState
          v-if="!expenseTree.length"
          icon="📂"
          title="Nenhuma categoria"
          description="Crie categorias de despesa para organizar seus lançamentos."
        />
        <ul v-else class="space-y-1">
          <CategoryRow
            v-for="cat in expenseTree"
            :key="cat.id"
            :category="cat"
            @edit="openEdit"
            @delete="confirmDelete"
          />
        </ul>
      </div>
    </div>

    <CategoryFormModal v-model="modalOpen" :category="editingCategory" @saved="categoriesStore.fetchCategories()" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useCategoriesStore } from '@/stores/categories'
  import { useNotification } from '@/composables/useNotification'
  import { getErrorMessage } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import EmptyState from '@/components/ui/EmptyState.vue'
  import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
  import CategoryRow from '@/components/categories/CategoryRow.vue'

  const categoriesStore = useCategoriesStore()
  const { success, error: notifyError } = useNotification()

  const modalOpen = ref(false)
  const editingCategory = ref(null)

  function buildTree(items) {
    const roots = items.filter((c) => !c.parent_id)
    return roots.map((root) => ({
      ...root,
      children: items.filter((c) => c.parent_id === root.id),
    }))
  }

  const incomeTree = computed(() => buildTree(categoriesStore.incomeCategories))
  const expenseTree = computed(() => buildTree(categoriesStore.expenseCategories))

  function openCreate() {
    editingCategory.value = null
    modalOpen.value = true
  }

  function openEdit(category) {
    editingCategory.value = category
    modalOpen.value = true
  }

  async function confirmDelete(category) {
    if (!confirm(`Excluir a categoria "${category.name}"? Transações vinculadas ficam sem categoria.`)) return

    try {
      await categoriesStore.deleteCategory(category.id)
      success('Categoria excluída com sucesso.')
    } catch (e) {
      notifyError(getErrorMessage(e))
    }
  }

  onMounted(() => categoriesStore.fetchCategories())
</script>
