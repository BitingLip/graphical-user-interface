<template>
  <ElementCard
    :title="title"
    :variant="variant"
    :hoverable="hoverable"
    class="dashboard-card"
  >
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
    <template #actions v-if="$slots.actions">
      <slot name="actions"></slot>
    </template>
    
    <div :class="['dashboard-card__content', { 'dashboard-card__content--loading': loading }]">
      <div v-if="loading" class="dashboard-card__loading">
        <ElementSpinner :size="loadingSize" :text="loadingText" />
      </div>
      <div v-else-if="error" class="dashboard-card__error">
        <span class="material-symbols-outlined error-icon">error</span>
        <div class="error-message">{{ error }}</div>
        <ElementButton 
          v-if="onRetry" 
          variant="primary" 
          size="sm" 
          @click="onRetry"
        >
          Retry
        </ElementButton>
      </div>
      <template v-else>
        <slot></slot>
      </template>
    </div>
    
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </ElementCard>
</template>

<script setup lang="ts">
import ElementCard from '../../elements/ElementCard.vue';
import ElementSpinner from '../../elements/ElementSpinner.vue';
import ElementButton from '../../elements/ElementButton.vue';

interface Props {
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverable?: boolean;
  loading?: boolean;
  loadingText?: string;
  loadingSize?: 'sm' | 'md' | 'lg';
  error?: string;
  onRetry?: () => void;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
  loading: false,
  loadingSize: 'md',
  loadingText: 'Loading...',
});
</script>

<style scoped>
.dashboard-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-card__content {
  flex: 1;
  position: relative;
  min-height: 100px;
}

.dashboard-card__content--loading {
  opacity: 0.7;
}

.dashboard-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.75);
  z-index: 5;
}

.dashboard-card__error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1rem;
}

.error-icon {
  font-size: 2.5rem;
  color: var(--bl-error);
}

.error-message {
  color: var(--bl-text-secondary);
  margin-bottom: 1rem;
}
</style>
