<template>
  <div 
    :class="[
      'element-input', 
      `element-input--${size}`,
      { 
        'element-input--error': hasError, 
        'element-input--disabled': disabled,
        'element-input--textarea': type === 'textarea'
      }
    ]"
  >
    <label v-if="label" class="element-input__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="element-input__required">*</span>
    </label>
    
    <div class="element-input__wrapper">
      <span v-if="prefixIcon && type !== 'textarea'" class="element-input__prefix-icon material-symbols-outlined">
        {{ prefixIcon }}
      </span>
      
      <!-- Standard input field -->
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="element-input__field"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- Textarea field -->
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :rows="rows"
        class="element-input__field element-input__textarea"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      
      <span v-if="suffixIcon && type !== 'textarea'" class="element-input__suffix-icon material-symbols-outlined">
        {{ suffixIcon }}
      </span>
    </div>
    
    <div v-if="hasError || helperText" class="element-input__helper">
      <span v-if="hasError" class="element-input__error-text">
        {{ errorMessage }}
      </span>
      <span v-else-if="helperText" class="element-input__helper-text">
        {{ helperText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'date' | 'time' | 'datetime-local';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  maxlength?: number;
  minlength?: number;
  min?: number;
  max?: number;
  step?: number;
  autocomplete?: string;
  rows?: number; // For textarea
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  rows: 4,
  disabled: false,
  readonly: false,
  required: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'change': [event: Event];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const instance = getCurrentInstance();
const inputId = `element-input-${instance?.uid}`;

const hasError = computed(() => !!props.errorMessage);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: string | number = target.value;
  
  if (props.type === 'number') {
    value = target.valueAsNumber || 0;
  }
  
  emit('update:modelValue', value);
};

const handleChange = (event: Event) => {
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
.element-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.element-input__label {
  font-size: var(--bl-font-size-sm);
  font-weight: var(--bl-font-weight-medium);
  color: var(--bl-text-primary);
}

.element-input__required {
  color: var(--bl-error);
  margin-left: 0.25rem;
}

.element-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.element-input__field {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--shade-02);
  border-radius: 0.5rem;
  font-family: var(--font-primary);
  font-size: var(--font-primary-size);
  background-color: var(--shade-00);
  color: var(--shade-06);
  transition: all 0.3s ease;
  outline: none;
}

.element-input__textarea {
  resize: vertical;
  min-height: 80px;
}

.element-input__field:focus {
  border-color: var(--color-01);
  box-shadow: 0 0 0 3px var(--color-03);
}

.element-input__field::placeholder {
  color: var(--shade-03);
}

.element-input__field:disabled {
  background-color: var(--bl-background-secondary);
  color: var(--bl-text-disabled);
  cursor: not-allowed;
}

/* Different sizes */
.element-input--sm .element-input__field {
  padding: 0.375rem 0.5rem;
  font-size: var(--bl-font-size-xs);
}

.element-input--lg .element-input__field {
  padding: 0.75rem 1rem;
  font-size: var(--bl-font-size-md);
}

.element-input__prefix-icon,
.element-input__suffix-icon {
  position: absolute;
  color: var(--bl-text-secondary);
  font-size: 1.25rem;
  pointer-events: none;
}

.element-input__prefix-icon {
  left: 0.75rem;
}

.element-input__suffix-icon {
  right: 0.75rem;
}

.element-input--sm .element-input__prefix-icon,
.element-input--sm .element-input__suffix-icon {
  font-size: 1rem;
}

.element-input--sm .element-input__prefix-icon {
  left: 0.5rem;
}

.element-input--sm .element-input__suffix-icon {
  right: 0.5rem;
}

.element-input--lg .element-input__prefix-icon,
.element-input--lg .element-input__suffix-icon {
  font-size: 1.5rem;
}

.element-input--lg .element-input__prefix-icon {
  left: 1rem;
}

.element-input--lg .element-input__suffix-icon {
  right: 1rem;
}

.element-input__field:has(+ .element-input__prefix-icon) {
  padding-left: 2.5rem;
}

.element-input__wrapper:has(.element-input__prefix-icon) .element-input__field {
  padding-left: 2.5rem;
}

.element-input__wrapper:has(.element-input__suffix-icon) .element-input__field {
  padding-right: 2.5rem;
}

.element-input__helper {
  min-height: 1.25rem;
}

.element-input__error-text {
  font-size: 0.75rem;
  color: var(--bl-error);
}

.element-input__helper-text {
  font-size: 0.75rem;
  color: var(--shade-04);
}

.element-input--error .element-input__field {
  border-color: var(--bl-error);
}

.element-input--error .element-input__field:focus {
  border-color: var(--bl-error);
  box-shadow: 0 0 0 3px rgba(215, 58, 73, 0.2);
}

.element-input--disabled {
  opacity: 0.6;
}
</style>
