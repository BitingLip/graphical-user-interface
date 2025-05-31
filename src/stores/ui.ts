import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

export interface ModalConfig {
  id: string
  component: string
  props?: Record<string, any>
  persistent?: boolean
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
}

export interface SidebarSection {
  id: string
  title: string
  icon?: string
  items: Array<{
    id: string
    label: string
    route: string
    icon?: string
    badge?: string | number
    active?: boolean
  }>
  collapsed?: boolean
}

export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<'light' | 'dark'>('dark')
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const toasts = ref<ToastMessage[]>([])
  const modals = ref<ModalConfig[]>([])
  const pageTitle = ref('BitingLip AI Platform')
  const breadcrumbs = ref<Array<{ label: string; route?: string }>>([])
  
  // Layout state
  const headerHeight = ref(64)
  const sidebarWidth = ref(256)
  const sidebarCollapsedWidth = ref(64)
  
  // Connection status
  const isOnline = ref(true)
  const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connected')
  
  // Current view state
  const currentView = ref<string>('')
  const viewLoading = ref(false)
  const viewError = ref<string | null>(null)

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const currentSidebarWidth = computed(() => 
    sidebarCollapsed.value ? sidebarCollapsedWidth.value : sidebarWidth.value
  )
  const activeToasts = computed(() => toasts.value)
  const activeModals = computed(() => modals.value)
  const hasActiveModals = computed(() => modals.value.length > 0)

  // Actions
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    localStorage.setItem('bitinglip-theme', newTheme)
    
    // Update document class for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('bitinglip-sidebar-collapsed', sidebarCollapsed.value.toString())
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('bitinglip-sidebar-collapsed', collapsed.toString())
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function setViewLoading(isLoading: boolean) {
    viewLoading.value = isLoading
  }

  function setViewError(error: string | null) {
    viewError.value = error
  }

  function setCurrentView(view: string) {
    currentView.value = view
    viewError.value = null
  }

  function setPageTitle(title: string) {
    pageTitle.value = title
    document.title = `${title} | BitingLip AI Platform`
  }

  function setBreadcrumbs(crumbs: Array<{ label: string; route?: string }>) {
    breadcrumbs.value = crumbs
  }

  function setConnectionStatus(status: 'connected' | 'connecting' | 'disconnected') {
    connectionStatus.value = status
    isOnline.value = status === 'connected'
  }

  // Toast management
  function showToast(toast: Omit<ToastMessage, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  // Modal management
  function showModal(modal: Omit<ModalConfig, 'id'>) {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newModal: ModalConfig = {
      id,
      size: 'medium',
      ...modal
    }
    
    modals.value.push(newModal)
    return id
  }

  function removeModal(id: string) {
    const index = modals.value.findIndex(modal => modal.id === id)
    if (index > -1) {
      modals.value.splice(index, 1)
    }
  }

  function clearModals() {
    modals.value = []
  }

  // Utility functions
  function showSuccessToast(title: string, message?: string) {
    return showToast({ type: 'success', title, message })
  }

  function showErrorToast(title: string, message?: string) {
    return showToast({ type: 'error', title, message, duration: 8000 })
  }

  function showWarningToast(title: string, message?: string) {
    return showToast({ type: 'warning', title, message })
  }

  function showInfoToast(title: string, message?: string) {
    return showToast({ type: 'info', title, message })
  }

  // Initialize from localStorage
  function initializeFromStorage() {
    // Theme
    const savedTheme = localStorage.getItem('bitinglip-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to dark theme
      setTheme('dark')
    }
    
    // Sidebar
    const savedSidebarState = localStorage.getItem('bitinglip-sidebar-collapsed')
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }
  }

  // Initialize online status
  function initializeOnlineStatus() {
    isOnline.value = navigator.onLine
    
    window.addEventListener('online', () => {
      isOnline.value = true
      setConnectionStatus('connected')
      showSuccessToast('Connection Restored', 'You are back online')
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
      setConnectionStatus('disconnected')
      showWarningToast('Connection Lost', 'You are currently offline')
    })
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    loading,
    toasts,
    modals,
    pageTitle,
    breadcrumbs,
    headerHeight,
    sidebarWidth,
    sidebarCollapsedWidth,
    isOnline,
    connectionStatus,
    currentView,
    viewLoading,
    viewError,
    
    // Getters
    isDark,
    currentSidebarWidth,
    activeToasts,
    activeModals,
    hasActiveModals,
    
    // Actions
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarCollapsed,
    setLoading,
    setViewLoading,
    setViewError,
    setCurrentView,
    setPageTitle,
    setBreadcrumbs,
    setConnectionStatus,
    showToast,
    removeToast,
    clearToasts,
    showModal,
    removeModal,
    clearModals,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    initializeFromStorage,
    initializeOnlineStatus
  }
})
