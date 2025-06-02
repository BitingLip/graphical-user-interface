<template>
  <div :class="['form-field-group', { 'form-field-group--inline': inline }]">
    <template v-if="label">
      <label v-if="inline" class="form-field-label form-field-label--inline" :for="fieldId">
        {{ label }}
        <span v-if="required" class="form-field-required">*</span>
      </label>
      <label v-else class="form-field-label" :for="fieldId">
        {{ label }}
        <span v-if="required" class="form-field-required">*</span>
      </label>
    </template>
    
    <div class="form-field-content">
      <slot></slot>
      
      <div v-if="error || helperText" class="form-field-helper">
        <span v-if="error" class="form-field-error">{{ error }}</span>
        <span v-else-if="helperText" class="form-field-helper-text">{{ helperText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

interface Props {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  inline: false
});

const instance = getCurrentInstance();
const fieldId = `form-field-${instance?.uid}`;
</script>

<style scoped>
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-field-group--inline {
  flex-direction: row;
  align-items: flex-start;
}

.form-field-label {
  font-size: var(--bl-font-size-sm);
  font-weight: var(--bl-font-weight-medium);
  color: var(--bl-text-primary);
}

.form-field-label--inline {
  width: 30%;
  flex-shrink: 0;
  padding-top: 0.5rem;
}

.form-field-required {
  color: var(--bl-error);
  margin-left: 0.25rem;
}

.form-field-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field-helper {
  min-height: 1.25rem;
  margin-top: 0.25rem;
}

.form-field-error {
  font-size: var(--bl-font-size-xs);
  color: var(--bl-error);
}

.form-field-helper-text {
  font-size: var(--bl-font-size-xs);
  color: var(--bl-text-secondary);
}

@media (max-width: 640px) {
  .form-field-group--inline {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-field-label--inline {
    width: 100%;
    padding-top: 0;
  }
}
</style>
