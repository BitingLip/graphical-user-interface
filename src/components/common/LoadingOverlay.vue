<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
      <ProgressSpinner />
      <p class="text-lg font-medium text-gray-900 dark:text-white">Loading...</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">Please wait while we process your request</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'

defineEmits(['close'])
</script>
