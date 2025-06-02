<template>
  <label :class="['element-toggle', { 'element-toggle--checked': modelValue, 'element-toggle--disabled': disabled }]">
    <span v-if="label" class="element-toggle__label">{{ label }}</span>
    <div class="element-toggle__switch">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="element-toggle__input"
        @change="handleChange"
      />
      <span class="element-toggle__slider"></span>
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [event: Event];
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', event);
};
</script>

<style scoped>
.element-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.element-toggle--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.element-toggle__label {
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-primary);
}

.element-toggle__switch {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.5rem;
}

.element-toggle__input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.element-toggle__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bl-border);
  transition: 0.2s ease;
  border-radius: 999px;
}

.element-toggle__slider:before {
  position: absolute;
  content: "";
  height: 1.125rem;
  width: 1.125rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: white;
  transition: 0.2s ease;
  border-radius: 50%;
}

.element-toggle--checked .element-toggle__slider {
  background-color: var(--bl-blue);
}

.element-toggle--checked .element-toggle__slider:before {
  transform: translateX(1rem);
}

.element-toggle--disabled .element-toggle__slider {
  background-color: var(--bl-text-disabled);
}

.element-toggle:focus-within .element-toggle__slider {
  box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
}

.element-toggle--checked:focus-within .element-toggle__slider {
  box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.3);
}
</style>
