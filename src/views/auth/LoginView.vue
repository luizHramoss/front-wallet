<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">💸</div>
        <h1 class="text-2xl font-bold text-ink">Entrar na sua conta</h1>
        <p class="text-muted mt-1 text-sm">Gerencie sua carteira digital com segurança</p>
      </div>

      <!-- Card -->
      <div class="card shadow-md">
        <ErrorAlert :message="serverError" class="mb-5" />

        <form novalidate @submit.prevent="handleSubmit">
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
          <div class="mb-6">
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="block text-sm font-medium text-ink">Senha</label>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="input"
              :class="{ 'input-error': errors.password }"
            />
            <FieldError :message="errors.password" />
          </div>

          <button
            type="submit"
            class="btn-primary btn-lg w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner" />
            <span v-else>Entrar</span>
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-muted">
          Não tem conta?
          <RouterLink :to="{ name: 'Register' }" class="text-brand-600 font-medium hover:underline">
            Criar conta
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { RouterLink, useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { validateLogin } from '@/validations/transaction'
  import { getErrorMessage, getFieldErrors } from '@/utils/currency'
  import ErrorAlert from '@/components/ui/ErrorAlert.vue'
  import FieldError from '@/components/ui/FieldError.vue'

  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  const loading = ref(false)
  const serverError = ref('')
  const form = reactive({ email: '', password: '' })
  const errors = reactive({ email: '', password: '' })

  function clearErrors() {
    errors.email = ''
    errors.password = ''
    serverError.value = ''
  }

  async function handleSubmit() {
    clearErrors()

    const fieldErrors = validateLogin(form)
    if (Object.keys(fieldErrors).length) {
      Object.assign(errors, fieldErrors)
      return
    }

    loading.value = true
    try {
      await auth.login({ email: form.email, password: form.password })
      const redirect = route.query.redirect ?? '/'
      router.push(redirect)
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
