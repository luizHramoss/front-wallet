<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">💸</div>
        <h1 class="text-2xl font-bold text-ink">Criar conta</h1>
        <p class="text-muted mt-1 text-sm">Sua carteira digital pessoal, grátis</p>
      </div>

      <!-- Card -->
      <div class="card shadow-md">
        <ErrorAlert :message="serverError" class="mb-5" />

        <form novalidate @submit.prevent="handleSubmit">
          <!-- Nome -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-ink mb-1.5">Nome completo</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              placeholder="João Silva"
              class="input"
              :class="{ 'input-error': errors.name }"
            />
            <FieldError :message="errors.name" />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-ink mb-1.5">E-mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="input"
              :class="{ 'input-error': errors.email }"
            />
            <FieldError :message="errors.email" />
          </div>

          <!-- Senha -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-ink mb-1.5">Senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
              class="input"
              :class="{ 'input-error': errors.password }"
            />
            <FieldError :message="errors.password" />
          </div>

          <!-- Confirmar senha -->
          <div class="mb-6">
            <label for="password_confirmation" class="block text-sm font-medium text-ink mb-1.5">
              Confirmar senha
            </label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a senha"
              class="input"
              :class="{ 'input-error': errors.password_confirmation }"
            />
            <FieldError :message="errors.password_confirmation" />
          </div>

          <button type="submit" class="btn-primary btn-lg w-full" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>Criar conta</span>
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-muted">
          Já tem conta?
          <RouterLink :to="{ name: 'Login' }" class="text-brand-600 font-medium hover:underline">
            Entrar
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { RouterLink, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { validateRegister } from '@/validations/transaction'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import FieldError from '@/components/ui/FieldError.vue'

  const router = useRouter()
  const auth = useAuthStore()

  const loading = ref(false)
  const serverError = ref('')
  const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const errors = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  function clearErrors() {
    Object.keys(errors).forEach((k) => (errors[k] = ''))
    serverError.value = ''
  }

  async function handleSubmit() {
    clearErrors()

    const fieldErrors = validateRegister(form)
    if (Object.keys(fieldErrors).length) {
      Object.assign(errors, fieldErrors)
      return
    }

    loading.value = true
    try {
      await auth.register({ ...form })
      router.push({ name: 'Dashboard' })
    } catch (e) {
      const fieldErrs = getFieldErrors(e)
      if (Object.keys(fieldErrs).length) {
        Object.assign(errors, fieldErrs)
      } else {
        serverError.value = getErrorMessage(e)
      }
    } finally {
      loading.value = false
    }
  }
</script>
