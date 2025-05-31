<template>
  <div 
    v-if="visible"
    class="fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
  >
    <div 
      class="w-3 h-3 rounded-full animate-pulse"
      :class="{
        'bg-green-500': uiStore.connectionStatus === 'connected',
        'bg-yellow-500': uiStore.connectionStatus === 'connecting',
        'bg-red-500': uiStore.connectionStatus === 'disconnected'
      }"
    ></div>
    <span class="text-sm font-medium text-gray-900 dark:text-white">
      {{ statusText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const visible = ref(false)

const statusText = computed(() => {
  switch (uiStore.connectionStatus) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'disconnected':
      return 'Disconnected'
    default:
      return 'Unknown'
  }
})

// Show/hide based on connection status
watch(() => uiStore.connectionStatus, (newStatus) => {
  if (newStatus === 'connecting' || newStatus === 'disconnected') {
    visible.value = true
  } else {
    // Hide after 3 seconds when connected
    setTimeout(() => {
      visible.value = false
    }, 3000)
  }
}, { immediate: true })
</script>
