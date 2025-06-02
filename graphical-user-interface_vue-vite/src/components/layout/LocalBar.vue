<template>
  <div class="localbar">
    <nav class="localbar-nav">
      <div 
        v-for="item in navItems" 
        :key="item.id"
        :class="['localbar-nav-item', { active: currentTab === item.id }]"
        @click="selectTab(item.id)"
      >
        <span class="material-symbols-outlined menu-item-icon">{{ item.icon }}</span>
        {{ item.label }}
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export default defineComponent({
  name: 'LocalBar',
  setup(props, { emit }) {
    const navItems: NavItem[] = [
      { id: 'clusters', label: 'Clusters', icon: 'device_hub' },
      { id: 'tasks', label: 'Tasks', icon: 'assignment' },
      { id: 'models', label: 'Models', icon: 'model_training' },
      { id: 'gateway', label: 'Gateway', icon: 'dns' }
    ];
    
    const currentTab = ref('clusters');
    
    const selectTab = (tabId: string) => {
      currentTab.value = tabId;
      emit('tab-change', tabId);
    };
    
    return {
      navItems,
      currentTab,
      selectTab
    };
  }
});
</script>

<style scoped>
.localbar {
  background: var(--shade-01);
  border-bottom: 1px solid var(--shade-02);
  box-shadow: var(--shadow-00);
}

.localbar-nav-item {
  gap: 0.5rem;
  color: var(--shade-04);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font-primary);
  font-size: var(--font-primary-size);
}

.localbar-nav-item:hover {
  background: var(--color-05);
  color: var(--shade-06);
}

.localbar-nav-item.active {
  background: var(--color-02);
  color: var(--shade-07);
}

.menu-item-icon {
  font-size: 1.25rem;
}

@media (max-width: 576px) {
  .localbar-nav-item {
    padding: 0.5rem;
  }
}
</style>
