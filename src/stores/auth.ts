import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, AuthToken, LoginCredentials } from '@/types'
import { UserRole } from '@/types'
import { authApi } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null    
    try {
      // Development bypass - REMOVE IN PRODUCTION
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        console.log('🔧 Development login bypass activated')
        user.value = {
          id: 'dev-admin-001',
          username: 'admin',
          email: 'admin@bitinglip.dev',
          role: UserRole.ADMIN,
          name: 'Development Admin',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
        token.value = 'dev-token-' + Date.now()
        localStorage.setItem('auth_token', token.value)
        return true
      }

      // Try API authentication
      const authData = await authApi.login(credentials)
      token.value = authData.access_token
      user.value = authData.user
      localStorage.setItem('auth_token', authData.access_token)
      return true
    } catch (err: any) {
      console.error('Login failed:', err)
      error.value = err.response?.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      loading.value = false
    }
  }

  async function loadProfile() {
    if (!token.value) return
    
    loading.value = true
    try {
      user.value = await authApi.getProfile()
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Token might be invalid, logout
      await logout()
    } finally {
      loading.value = false
    }
  }

  async function validateToken() {
    if (!token.value) {
      return false
    }
    
    loading.value = true
    error.value = null
    try {
      user.value = await authApi.getProfile()
      return true
    } catch (err) {
      console.error('Token validation failed:', err)
      error.value = 'Session expired'
      await logout()
      return false
    } finally {
      loading.value = false
    }
  }

  // Initialize on store creation
  if (token.value && !user.value) {
    loadProfile()
  }

  return {
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    loadProfile,
    validateToken
  }
})
