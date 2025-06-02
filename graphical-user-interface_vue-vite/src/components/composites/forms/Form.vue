<template>
  <form class="composite-form" @submit.prevent="handleSubmit" novalidate>
    <slot></slot>
    
    <div v-if="formError" class="form-error">
      {{ formError }}
    </div>
    
    <div v-if="$slots.actions || showDefaultActions" class="form-actions">
      <slot name="actions">
        <div v-if="showDefaultActions" class="default-actions">
          <ElementButton 
            v-if="showCancelButton" 
            type="button" 
            variant="secondary"
            @click="handleCancel"
          >
            {{ cancelText }}
          </ElementButton>
          <ElementButton 
            type="submit" 
            :disabled="loading || disabled" 
            :loading="loading"
          >
            {{ submitText }}
          </ElementButton>
        </div>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import ElementButton from '../../elements/ElementButton.vue';

interface Props {
  loading?: boolean;
  disabled?: boolean;
  showDefaultActions?: boolean;
  showCancelButton?: boolean;
  submitText?: string;
  cancelText?: string;
  formError?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  showDefaultActions: true,
  showCancelButton: true,
  submitText: 'Submit',
  cancelText: 'Cancel',
});

const emit = defineEmits<{
  submit: [event: Event];
  cancel: [];
}>();

const handleSubmit = (event: Event) => {
  if (!props.loading && !props.disabled) {
    emit('submit', event);
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.composite-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.form-error {
  padding: 0.75rem;
  background-color: var(--bl-error-light);
  border-left: 4px solid var(--bl-error);
  color: var(--bl-error);
  border-radius: 4px;
  font-size: var(--bl-font-size-sm);
}

.form-actions {
  padding-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  border-top: 1px solid var(--bl-border);
}

.default-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 576px) {
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .default-actions {
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    gap: 0.5rem;
  }
  
  .default-actions button {
    width: 100%;
  }
}
</style>
