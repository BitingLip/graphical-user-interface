<template>
  <span :class="['element-badge', `element-badge--${variant}`, `element-badge--${size}`]">
    <span v-if="icon" class="element-badge__icon material-symbols-outlined">
      {{ icon }}
    </span>
    <span class="element-badge__text">
      <slot>{{ text }}</slot>
    </span>
    <button
      v-if="removable"
      type="button"
      class="element-badge__remove"
      @click="$emit('remove')"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  removable?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  removable: false
});

defineEmits<{
  remove: [];
}>();
</script>

<style scoped>
.element-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--bl-font-primary);
  font-weight: var(--bl-font-weight-medium);
  border-radius: 9999px;
  white-space: nowrap;
  vertical-align: middle;
}

/* Sizes */
.element-badge--sm {
  padding: 0.125rem 0.5rem;
  font-size: var(--bl-font-size-xs);
}

.element-badge--md {
  padding: 0.25rem 0.625rem;
  font-size: var(--bl-font-size-xs);
}

.element-badge--lg {
  padding: 0.375rem 0.75rem;
  font-size: var(--bl-font-size-sm);
}

/* Variants */
.element-badge--default {
  background-color: var(--bl-table-header-bg);
  color: var(--bl-text-secondary);
}

.element-badge--primary {
  background-color: var(--bl-blue);
  color: white;
}

.element-badge--success {
  background-color: var(--bl-success-light);
  color: var(--bl-success);
}

.element-badge--warning {
  background-color: var(--bl-warning-light);
  color: var(--bl-warning);
}

.element-badge--danger {
  background-color: var(--bl-error-light);
  color: var(--bl-error);
}

.element-badge--info {
  background-color: var(--bl-info-light);
  color: var(--bl-info);
}

.element-badge__icon {
  font-size: 1rem;
}

.element-badge--sm .element-badge__icon {
  font-size: 0.875rem;
}

.element-badge--lg .element-badge__icon {
  font-size: 1.125rem;
}

.element-badge__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  padding: 0;
  margin-left: 0.125rem;
  transition: background-color 0.2s ease;
}

.element-badge__remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.element-badge__remove .material-symbols-outlined {
  font-size: 0.75rem;
}
</style>
