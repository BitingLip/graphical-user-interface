<template>
  <button
    :class="[
      'element-button',
      `element-button--${variant}`,
      `element-button--${size}`,
      {
        'element-button--disabled': disabled,
        'element-button--loading': loading,
        'element-button--icon-only': iconOnly
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="element-button__spinner material-symbols-outlined">
      hourglass_empty
    </span>
    <span v-else-if="icon" class="element-button__icon material-symbols-outlined">
      {{ icon }}
    </span>
    <span v-if="!iconOnly && !loading" class="element-button__text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconOnly: false
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.element-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--bl-font-primary);
  font-weight: var(--bl-font-weight-medium);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;
  position: relative;
  white-space: nowrap;
}

.element-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.3);
}

/* Variants */
.element-button--primary {
  background-color: var(--bl-button-primary);
  color: white;
}

.element-button--primary:hover:not(:disabled) {
  background-color: var(--bl-button-primary-hover);
}

.element-button--secondary {
  background-color: var(--bl-button-secondary);
  color: var(--bl-text-secondary);
  border: 1px solid var(--bl-border);
}

.element-button--secondary:hover:not(:disabled) {
  background-color: var(--bl-button-secondary-hover);
  color: var(--bl-text-primary);
}

.element-button--danger {
  background-color: var(--bl-error);
  color: white;
}

.element-button--danger:hover:not(:disabled) {
  background-color: #b52d3a;
}

.element-button--success {
  background-color: var(--bl-success);
  color: white;
}

.element-button--success:hover:not(:disabled) {
  background-color: #1e6f32;
}

.element-button--ghost {
  background-color: transparent;
  color: var(--bl-text-secondary);
}

.element-button--ghost:hover:not(:disabled) {
  background-color: var(--bl-table-header-bg);
  color: var(--bl-text-primary);
}

/* Sizes */
.element-button--sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--bl-font-size-sm);
}

.element-button--md {
  padding: 0.5rem 1rem;
  font-size: var(--bl-font-size-sm);
}

.element-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: var(--bl-font-size-md);
}

/* Icon only buttons */
.element-button--icon-only {
  padding: 0.5rem;
  border-radius: 50%;
  aspect-ratio: 1;
}

.element-button--icon-only.element-button--sm {
  padding: 0.375rem;
}

.element-button--icon-only.element-button--lg {
  padding: 0.75rem;
}

/* States */
.element-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.element-button--loading {
  cursor: wait;
}

.element-button__spinner {
  animation: spin 1s linear infinite;
}

.element-button__icon {
  font-size: 1.25rem;
}

.element-button--sm .element-button__icon {
  font-size: 1rem;
}

.element-button--lg .element-button__icon {
  font-size: 1.5rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
