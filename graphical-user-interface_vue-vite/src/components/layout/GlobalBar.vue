<template>
  <div class="globalbar">
    <div class="globalbar-left">
      <button class="btn btn-icon menu-button" @click="togglePlatformMenu">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <div class="logo">
        <span>Biting Lip</span>
      </div>
      <div class="location">
        <span>{{ currentLocation }}</span>
      </div>
    </div>
    <div class="globalbar-right">
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Search..." />
        <span class="material-symbols-outlined search-icon">search</span>
      </div>
      <button class="btn btn-icon profile-button" @click="toggleProfileMenu">
        <span class="material-symbols-outlined">account_circle</span>
      </button>
    </div>
    
    <!-- Platform Menu Overlay -->
    <div v-if="showPlatformMenu" class="menu-overlay menu-overlay-left">
      <div class="menu-item" @click="selectView('home')">
        <span class="material-symbols-outlined menu-item-icon">home</span>
        <span>Home</span>
      </div>
      <div class="menu-item" @click="selectView('issues')">
        <span class="material-symbols-outlined menu-item-icon">bug_report</span>
        <span>Issues</span>
      </div>
      <div class="menu-item" @click="selectView('discussions')">
        <span class="material-symbols-outlined menu-item-icon">forum</span>
        <span>Discussions</span>
      </div>
      <div class="menu-item" @click="selectView('documentation')">
        <span class="material-symbols-outlined menu-item-icon">description</span>
        <span>Documentation</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item">
        <span class="material-symbols-outlined menu-item-icon">settings</span>
        <span>Settings</span>
      </div>
    </div>
    
    <!-- Profile Menu Overlay -->
    <div v-if="showProfileMenu" class="menu-overlay menu-overlay-right">
      <div class="menu-item" @click="selectView('profile')">
        <span class="material-symbols-outlined menu-item-icon">person</span>
        <span>Your Profile</span>
      </div>
      <div class="menu-item">
        <span class="material-symbols-outlined menu-item-icon">settings</span>
        <span>Settings</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item">
        <span class="material-symbols-outlined menu-item-icon">logout</span>
        <span>Sign Out</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'GlobalBar',  setup(props, { emit }) {
    const showPlatformMenu = ref(false);
    const showProfileMenu = ref(false);
    const currentLocation = ref('Dashboard');

    const togglePlatformMenu = () => {
      showPlatformMenu.value = !showPlatformMenu.value;
      if (showPlatformMenu.value) {
        showProfileMenu.value = false;
      }
    };

    const toggleProfileMenu = () => {
      showProfileMenu.value = !showProfileMenu.value;
      if (showProfileMenu.value) {
        showPlatformMenu.value = false;
      }
    };

    const selectView = (view: string) => {
      showPlatformMenu.value = false;
      showProfileMenu.value = false;
      
      // Emit event to parent component to change the view
      emit('view-change', view);
    };

    return {
      showPlatformMenu,
      showProfileMenu,
      currentLocation,
      togglePlatformMenu,
      toggleProfileMenu,
      selectView
    };
  }
});
</script>

<style scoped>
.globalbar {
  position: relative;
  background: var(--shade-00);
  border-bottom: 1px solid var(--shade-02);
  box-shadow: var(--shadow-01);
}

.location {
  margin-left: 1rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-05);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--shade-04);
}

.menu-button, .profile-button {
  color: var(--shade-04);
  background-color: transparent;
  border: 1px solid var(--shade-02);
  transition: all 0.3s ease;
}

.menu-button:hover, .profile-button:hover {
  color: var(--shade-06);
  background-color: var(--color-05);
  border-color: var(--color-02);
}

.search-container {
  position: relative;
  margin-right: 1rem;
}

.search-input {
  background-color: var(--shade-00);
  border: 1px solid var(--shade-02);
  border-radius: 0.5rem;
  color: var(--shade-06);
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  font-size: 0.875rem;
  width: 240px;
  transition: all 0.3s ease;
}

.search-input:focus {
  background-color: var(--shade-00);
  border-color: var(--color-01);
  box-shadow: 0 0 0 3px var(--color-03);
  outline: none;
  width: 300px;
}

.search-input::placeholder {
  color: var(--shade-03);
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--shade-03);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }
}
</style>
