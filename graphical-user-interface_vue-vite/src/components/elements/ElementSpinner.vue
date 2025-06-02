<template>
  <div :class="['element-spinner', `element-spinner--${size}`]" :aria-label="label">
    <div class="element-spinner__circle"></div>
    <span v-if="text" class="element-spinner__text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  label: 'Loading...'
});
</script>

<style scoped>
.element-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.element-spinner__circle {
  border-radius: 50%;
  border: 2px solid var(--bl-border);
  border-top: 2px solid var(--bl-blue);
  animation: spin 1s linear infinite;
}

.element-spinner--sm .element-spinner__circle {
  width: 1rem;
  height: 1rem;
}

.element-spinner--md .element-spinner__circle {
  width: 1.5rem;
  height: 1.5rem;
}

.element-spinner--lg .element-spinner__circle {
  width: 2rem;
  height: 2rem;
}

.element-spinner__text {
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-secondary);
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
