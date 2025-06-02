<script setup lang="ts">
import { ref, onMounted } from 'vue';
import "@/assets/css/fonts.css";
import "@/assets/css/colors.css";
import "@/assets/css/main.css";

import GlobalBar from './components/layout/GlobalBar.vue';
import LocalBar from './components/layout/LocalBar.vue';
import Dashboard from './components/layout/Dashboard.vue';
import { useAppStore } from './stores/appStore';

// Initialize the store
const appStore = useAppStore();
const currentView = ref(appStore.currentView);

// Theme management
const isDarkTheme = ref(true);

// Handle tab change events
const handleTabChange = (tabId: string) => {
  currentView.value = tabId;
  appStore.setCurrentView(tabId);
};

// Handle global menu selections
const handleViewChange = (viewName: string) => {
  currentView.value = viewName;
  appStore.setCurrentView(viewName);
};

// Toggle theme
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
};

// Initialize with default view and theme
onMounted(() => {
  currentView.value = 'clusters';
  // Set default dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
});
</script>

<template>
  <div id="app">
    <GlobalBar @view-change="handleViewChange" />
    <LocalBar @tab-change="handleTabChange" />
    <Dashboard :view-name="currentView" />
    
    <!-- Theme Toggle Button (floating) -->
    <button 
      class="theme-toggle-btn" 
      @click="toggleTheme"
      :title="isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
    >
      <span class="material-symbols-outlined">
        {{ isDarkTheme ? 'light_mode' : 'dark_mode' }}
      </span>
    </button>
  </div>
</template>

<style>
/* Import global styles */
@import './assets/css/main.css';

/* Import Material Icons */
@import 'material-icons/iconfont/material-icons.css';
@import 'material-symbols/outlined.css';

/* Theme Toggle Button */
.theme-toggle-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--color-01);
  color: var(--shade-07);
  border: 1px solid var(--shade-02);
  box-shadow: var(--shadow-02);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.theme-toggle-btn:hover {
  background: var(--color-02);
  transform: scale(1.1);
  box-shadow: var(--shadow-03);
}

.theme-toggle-btn .material-symbols-outlined {
  font-size: 1.5rem;
}
</style>
