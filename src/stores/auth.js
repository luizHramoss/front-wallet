import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

const TOKEN_KEY = 'wallet_token'
const USER_KEY = 'wallet_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? null)
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'))

  const isAuthenticated = computed(() => !!token.value)

  function _persist(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function _clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function register(data) {
    const res = await authApi.register(data)
    _persist(res.data.data.token, res.data.data.user)
    return res.data
  }

  async function login(data) {
    const res = await authApi.login(data)
    _persist(res.data.data.token, res.data.data.user)
    return res.data
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      _clear()
    }
  }

  return { token, user, isAuthenticated, register, login, logout }
})
