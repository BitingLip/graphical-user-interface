<template>
  <aside 
    class="fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30"
    :style="{ width: `${uiStore.currentSidebarWidth}px` }"
  >
    <!-- Logo Section -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
      <div v-if="!uiStore.sidebarCollapsed" class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-microchip text-white text-lg"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">BitingLip</h1>
          <p class="text-xs text-gray-600 dark:text-gray-400">AI Platform</p>
        </div>
      </div>
      <div v-else class="w-full flex justify-center">
        <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-microchip text-white text-lg"></i>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.route"
        :to="item.route"
        class="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        active-class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
      >
        <i :class="item.icon" class="text-lg"></i>
        <span v-if="!uiStore.sidebarCollapsed" class="font-medium">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const navigationItems = [
  { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
  { label: 'Clusters', route: '/clusters', icon: 'pi pi-server' },
  { label: 'Workers', route: '/workers', icon: 'pi pi-desktop' },
  { label: 'Models', route: '/models', icon: 'pi pi-microchip' },
  { label: 'Tasks', route: '/tasks', icon: 'pi pi-list' },
  { label: 'Monitoring', route: '/monitoring', icon: 'pi pi-chart-line' },
  { label: 'Settings', route: '/settings', icon: 'pi pi-cog' }
]
</script>
