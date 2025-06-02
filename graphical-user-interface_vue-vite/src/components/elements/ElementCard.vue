<template>
  <div :class="['element-card', `element-card--${variant}`, { 'element-card--hoverable': hoverable }]">
    <div v-if="$slots.header || title" class="element-card__header">
      <slot name="header">
        <h3 v-if="title" class="element-card__title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.actions" class="element-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div v-if="$slots.default" class="element-card__body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="element-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverable?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false
});
</script>

<style scoped>
.element-card {
  background-color: var(--bl-surface);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.element-card--default {
  box-shadow: var(--bl-shadow-small);
}

.element-card--outlined {
  border: 1px solid var(--bl-border);
}

.element-card--elevated {
  box-shadow: var(--bl-shadow-medium);
}

.element-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--bl-shadow-large);
  cursor: pointer;
}

.element-card__header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--bl-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.element-card__title {
  font-size: var(--bl-font-size-lg);
  font-weight: var(--bl-font-weight-medium);
  color: var(--bl-text-primary);
  margin: 0;
}

.element-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.element-card__body {
  padding: 1.5rem;
}

.element-card__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--bl-border);
  background-color: var(--bl-table-header-bg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .element-card__header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .element-card__body {
    padding: 1rem;
  }
  
  .element-card__footer {
    padding: 0.75rem 1rem;
  }
}
</style>
