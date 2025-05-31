<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Main Application Layout -->
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <AppSidebar />
      
      <!-- Main Content Area -->
      <div 
        class="flex-1 flex flex-col transition-all duration-300"
        :style="{ marginLeft: `${uiStore.currentSidebarWidth}px` }"
      >
        <!-- Header -->
        <AppHeader />
        
        <!-- Main Content -->
        <main class="flex-1 overflow-auto">
          <router-view v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <Suspense>
                <component :is="Component" />
                <template #fallback>
                  <div class="flex items-center justify-center h-64">
                    <ProgressSpinner />
                  </div>
                </template>
              </Suspense>
            </Transition>
          </router-view>
        </main>
      </div>
    </div>
    
    <!-- Login Page (when not authenticated) -->
    <div v-else class="min-h-screen">
      <router-view />
    </div>
    
    <!-- Global Toasts -->
    <Toast />
    
    <!-- Global Confirmations -->
    <ConfirmDialog />
    
    <!-- Connection Status Indicator -->
    <ConnectionStatus />
    
    <!-- Loading Overlay -->
    <LoadingOverlay v-if="uiStore.loading" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { webSocketService } from '@/services/websocket'

// Components
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'

// PrimeVue Components
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ProgressSpinner from 'primevue/progressspinner'

// Stores
const authStore = useAuthStore()
const uiStore = useUIStore()

onMounted(async () => {
  // Initialize UI from localStorage
  uiStore.initializeFromStorage()
  uiStore.initializeOnlineStatus()
  
  // Try to restore authentication
  const token = localStorage.getItem('auth_token')
  if (token) {
    await authStore.validateToken()
    
    // Connect WebSocket if authenticated
    if (authStore.isAuthenticated) {
      webSocketService.connect(token)
    }
  }
  
  // Set up WebSocket event listeners
  setupWebSocketListeners()
})

onUnmounted(() => {
  // Disconnect WebSocket on app unmount
  webSocketService.disconnect()
})

function setupWebSocketListeners() {
  // Connection events
  webSocketService.on('connected', () => {
    uiStore.setConnectionStatus('connected')
    uiStore.showSuccessToast('Connected', 'Real-time updates enabled')
  })
  
  webSocketService.on('disconnected', () => {
    uiStore.setConnectionStatus('disconnected')
  })
  
  webSocketService.on('error', (data) => {
    console.error('WebSocket error:', data.error)
    uiStore.showErrorToast('Connection Error', 'Real-time updates unavailable')
  })
  
  webSocketService.on('max_reconnect_attempts_reached', () => {
    uiStore.showErrorToast(
      'Connection Failed',
      'Unable to establish real-time connection. Please refresh the page.'
    )
  })
  
  // System events
  webSocketService.on('system_alert', (data) => {
    uiStore.showWarningToast('System Alert', data.message)
  })
}
</script>

<style scoped>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Ensure smooth transitions */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Custom scrollbar */
:deep(.p-component) {
  font-family: inherit;
}

/* Override PrimeVue dark theme for better integration */
:deep(.p-toast .p-toast-message) {
  @apply backdrop-blur-sm;
}

:deep(.p-confirm-dialog) {
  @apply backdrop-blur-sm;
}
</style>
