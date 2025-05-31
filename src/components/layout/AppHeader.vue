<template>
  <header 
    class="fixed top-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20"
    :style="{ left: `${uiStore.currentSidebarWidth}px`, height: `${uiStore.headerHeight}px` }"
  >
    <div class="flex items-center justify-between h-full px-6">
      <!-- Left Section -->
      <div class="flex items-center space-x-4">
        <Button
          icon="pi pi-bars"
          class="p-button-text p-button-rounded"
          @click="uiStore.toggleSidebar()"
        />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ uiStore.pageTitle }}</h2>
          <nav v-if="uiStore.breadcrumbs.length > 0" class="flex items-center space-x-2 text-sm">
            <template v-for="(crumb, index) in uiStore.breadcrumbs" :key="index">
              <router-link
                v-if="crumb.route"
                :to="crumb.route"
                class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                {{ crumb.label }}
              </router-link>
              <span v-else class="text-gray-900 dark:text-white">{{ crumb.label }}</span>
              <i v-if="index < uiStore.breadcrumbs.length - 1" class="pi pi-chevron-right text-xs text-gray-400"></i>
            </template>
          </nav>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">
        <!-- Connection Status -->
        <div class="flex items-center space-x-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': uiStore.connectionStatus === 'connected',
              'bg-yellow-500': uiStore.connectionStatus === 'connecting',
              'bg-red-500': uiStore.connectionStatus === 'disconnected'
            }"
          ></div>
          <span class="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {{ uiStore.connectionStatus }}
          </span>
        </div>

        <!-- Theme Toggle -->
        <Button
          :icon="uiStore.isDark ? 'pi pi-sun' : 'pi pi-moon'"
          class="p-button-text p-button-rounded"
          @click="uiStore.toggleTheme()"
        />

        <!-- User Menu -->
        <div class="relative">
          <Button
            :label="authStore.user?.username || 'User'"
            icon="pi pi-user"
            class="p-button-text"
            @click="toggleUserMenu"
          />
          
          <!-- Dropdown menu would go here -->
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import Button from 'primevue/button'

const authStore = useAuthStore()
const uiStore = useUIStore()
const showUserMenu = ref(false)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}
</script>
