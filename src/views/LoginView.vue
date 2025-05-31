<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-purple-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
          <i class="pi pi-microchip text-2xl text-purple-600"></i>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">BitingLip AI</h1>
        <p class="text-purple-200">GPU Cluster Management Platform</p>
      </div>

      <!-- Login Form -->
      <Card class="shadow-2xl border-0">
        <template #content>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Access your AI cluster dashboard</p>
            </div>

            <!-- Username Field -->
            <div class="space-y-2">
              <label for="username" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <InputText
                id="username"
                v-model="credentials.username"
                placeholder="Enter your username"
                class="w-full"
                :class="{ 'p-invalid': errors.username }"
                @input="clearFieldError('username')"
              />
              <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Password
                id="password"
                v-model="credentials.password"
                placeholder="Enter your password"
                class="w-full"
                :class="{ 'p-invalid': errors.password }"
                :feedback="false"
                toggle-mask
                @input="clearFieldError('password')"
              />
              <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Checkbox
                  id="remember"
                  v-model="rememberMe"
                  binary
                />
                <label for="remember" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" class="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400">
                Forgot password?
              </a>
            </div>

            <!-- Error Message -->
            <Message v-if="loginError" severity="error" :closable="false">
              {{ loginError }}
            </Message>

            <!-- Submit Button -->
            <Button
              type="submit"
              label="Sign In"
              icon="pi pi-sign-in"
              class="w-full"
              :loading="loading"
              :disabled="!isFormValid"
            />
          </form>
        </template>
      </Card>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-purple-200 text-sm">
          © 2024 BitingLip AI Platform. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

// PrimeVue Components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'

// Stores and router
const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()

// Reactive state
const credentials = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const loginError = ref('')

// Computed properties
const isFormValid = computed(() => {
  return credentials.username.trim() !== '' && 
         credentials.password.trim() !== '' && 
         !loading.value
})

// Methods
function clearFieldError(field: keyof typeof errors) {
  errors[field] = ''
  loginError.value = ''
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  errors.username = ''
  errors.password = ''
  
  // Validate username
  if (!credentials.username.trim()) {
    errors.username = 'Username is required'
    isValid = false
  }
  
  // Validate password
  if (!credentials.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

async function handleLogin() {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  loginError.value = ''
  
  try {
    const success = await authStore.login(credentials)
    
    if (success) {
      uiStore.showSuccessToast('Welcome!', 'Successfully logged in')
      
      // Redirect to dashboard or intended route
      const redirect = router.currentRoute.value.query.redirect as string
      await router.push(redirect || '/dashboard')
    } else {
      loginError.value = authStore.error || 'Login failed. Please check your credentials.'
    }
  } catch (error) {
    loginError.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Set page title
  uiStore.setPageTitle('Sign In')
  
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
  
  // Load remembered username if any
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    credentials.username = rememberedUsername
    rememberMe.value = true
  }
})

// Save username if remember me is checked
function saveRememberedUsername() {
  if (rememberMe.value) {
    localStorage.setItem('remembered_username', credentials.username)
  } else {
    localStorage.removeItem('remembered_username')
  }
}

// Watch for form submission to save username
function handleFormSubmit() {
  saveRememberedUsername()
  handleLogin()
}
</script>

<style scoped>
/* Custom styling for the login page */
.p-card {
  @apply bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm;
}

.p-inputtext,
.p-password {
  @apply transition-all duration-200;
}

.p-inputtext:focus,
.p-password:focus-within {
  @apply ring-2 ring-purple-500 ring-opacity-50;
}

.p-button {
  @apply bg-purple-600 border-purple-600 hover:bg-purple-700 hover:border-purple-700;
}

.p-checkbox.p-highlight .p-checkbox-box {
  @apply bg-purple-600 border-purple-600;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .p-card {
    @apply mx-2;
  }
}
</style>
