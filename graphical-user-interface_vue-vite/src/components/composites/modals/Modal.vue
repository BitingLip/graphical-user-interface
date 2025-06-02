<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeOnOverlayClick ? close() : null">
        <div :class="['modal-container', `modal-container--${size}`]">
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button 
              v-if="showCloseButton" 
              type="button" 
              class="modal-close-btn" 
              @click="close()" 
              aria-label="Close"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="modal-content">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
          <div v-else-if="showDefaultFooter" class="modal-footer modal-footer--default">
            <ElementButton 
              variant="secondary" 
              @click="close()"
            >
              Cancel
            </ElementButton>
            <ElementButton 
              @click="confirm()"
              :loading="loading"
              :disabled="loading"
            >
              {{ confirmText }}
            </ElementButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import ElementButton from '../../elements/ElementButton.vue';

interface Props {
  modelValue: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  showDefaultFooter?: boolean;
  confirmText?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlayClick: true,
  showCloseButton: true,
  showDefaultFooter: true,
  confirmText: 'Confirm',
  loading: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};

// Add event listener for ESC key
watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore body scroll
    }
  }
);

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--bl-surface);
  border-radius: 6px;
  box-shadow: var(--bl-shadow-large);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  width: 100%;
  max-width: 32rem;
}

.modal-container--sm {
  max-width: 24rem;
}

.modal-container--md {
  max-width: 32rem;
}

.modal-container--lg {
  max-width: 48rem;
}

.modal-container--xl {
  max-width: 64rem;
}

.modal-container--full {
  max-width: calc(100vw - 2rem);
  height: calc(100vh - 2rem);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--bl-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: var(--bl-font-size-lg);
  font-weight: var(--bl-font-weight-medium);
}

.modal-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  color: var(--bl-text-secondary);
}

.modal-close-btn:hover {
  background-color: var(--bl-divider);
  color: var(--bl-text-primary);
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--bl-border);
  background-color: var(--bl-table-header-bg);
}

.modal-footer--default {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: calc(100vw - 2rem) !important;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
