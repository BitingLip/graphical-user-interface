<template>
  <label :class="['element-checkbox', { 'element-checkbox--checked': isChecked, 'element-checkbox--disabled': disabled }]">
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
      class="element-checkbox__input"
    />
    <span class="element-checkbox__checkmark">
      <span v-if="isChecked" class="material-symbols-outlined element-checkbox__check-icon">
        check
      </span>
    </span>
    <span v-if="label || $slots.default" class="element-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
  value?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [event: Event];
}>();

const isChecked = computed(() => props.modelValue);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', event);
};
</script>

<style scoped>
.element-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-primary);
  transition: all 0.2s ease;
}

.element-checkbox--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.element-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.element-checkbox__checkmark {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--bl-border);
  border-radius: 3px;
  background-color: var(--bl-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.element-checkbox:hover:not(.element-checkbox--disabled) .element-checkbox__checkmark {
  border-color: var(--bl-blue);
}

.element-checkbox--checked .element-checkbox__checkmark {
  background-color: var(--bl-blue);
  border-color: var(--bl-blue);
}

.element-checkbox__check-icon {
  color: white;
  font-size: 1rem;
  line-height: 1;
}

.element-checkbox__label {
  font-weight: var(--bl-font-weight-regular);
  line-height: 1.4;
}

.element-checkbox:focus-within .element-checkbox__checkmark {
  box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.3);
}
</style>
