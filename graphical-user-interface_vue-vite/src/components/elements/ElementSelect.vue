<template>
  <div :class="['element-select', { 'element-select--error': hasError, 'element-select--disabled': disabled }]">
    <label v-if="label" class="element-select__label" :for="selectId">
      {{ label }}
      <span v-if="required" class="element-select__required">*</span>
    </label>
    
    <div class="element-select__wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="element-select__field"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
          :disabled="option.disabled"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <span class="element-select__icon material-symbols-outlined">
        expand_more
      </span>
    </div>
    
    <div v-if="hasError || helperText" class="element-select__helper">
      <span v-if="hasError" class="element-select__error-text">
        {{ errorMessage }}
      </span>
      <span v-else-if="helperText" class="element-select__helper-text">
        {{ helperText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
} | string;

interface Props {
  modelValue?: string | number;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  valueKey?: string;
  labelKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  disabled: false,
  required: false,
  valueKey: 'value',
  labelKey: 'label'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'change': [event: Event];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const instance = getCurrentInstance();
const selectId = `element-select-${instance?.uid}`;

const hasError = computed(() => !!props.errorMessage);

const getOptionValue = (option: SelectOption): string | number => {
  if (typeof option === 'string') {
    return option;
  }
  return option.value ?? option[props.valueKey];
};

const getOptionLabel = (option: SelectOption): string => {
  if (typeof option === 'string') {
    return option;
  }
  return option.label ?? option[props.labelKey] ?? String(option.value);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
  emit('change', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<style scoped>
.element-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.element-select__label {
  font-size: var(--bl-font-size-sm);
  font-weight: var(--bl-font-weight-medium);
  color: var(--bl-text-primary);
}

.element-select__required {
  color: var(--bl-error);
  margin-left: 0.25rem;
}

.element-select__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.element-select__field {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--bl-border);
  border-radius: 4px;
  font-family: var(--bl-font-primary);
  font-size: var(--bl-font-size-sm);
  background-color: var(--bl-surface);
  color: var(--bl-text-primary);
  transition: all 0.2s ease;
  appearance: none;
  outline: none;
  padding-right: 2rem;
}

.element-select__field:focus {
  border-color: var(--bl-blue);
  box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
}

.element-select__field:disabled {
  background-color: var(--bl-table-header-bg);
  color: var(--bl-text-disabled);
  cursor: not-allowed;
}

.element-select__icon {
  position: absolute;
  right: 0.75rem;
  color: var(--bl-text-secondary);
  font-size: 1.25rem;
  pointer-events: none;
}

.element-select__helper {
  min-height: 1.25rem;
}

.element-select__error-text {
  font-size: var(--bl-font-size-xs);
  color: var(--bl-error);
}

.element-select__helper-text {
  font-size: var(--bl-font-size-xs);
  color: var(--bl-text-secondary);
}

.element-select--error .element-select__field {
  border-color: var(--bl-error);
}

.element-select--error .element-select__field:focus {
  border-color: var(--bl-error);
  box-shadow: 0 0 0 3px rgba(215, 58, 73, 0.2);
}

.element-select--disabled {
  opacity: 0.6;
}
</style>
