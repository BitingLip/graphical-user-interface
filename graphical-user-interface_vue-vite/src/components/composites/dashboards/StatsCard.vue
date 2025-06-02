<template>
  <DashboardCard
    :title="title"
    :variant="variant"
    :hoverable="hoverable"
    :loading="loading"
    :error="error"
    :onRetry="onRetry"
    class="stats-card"
  >
    <div class="stats-card__container">
      <div class="stats-card__icon" :style="{ backgroundColor: iconBackground }">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
      <div class="stats-card__content">
        <div class="stats-card__value">{{ value }}</div>
        <div class="stats-card__label">{{ label }}</div>
        <div v-if="change !== undefined" :class="[
          'stats-card__change',
          change > 0 ? 'stats-card__change--positive' : change < 0 ? 'stats-card__change--negative' : ''
        ]">
          <span class="material-symbols-outlined">
            {{ change > 0 ? 'trending_up' : change < 0 ? 'trending_down' : 'trending_flat' }}
          </span>
          {{ Math.abs(change) }}%
          <span class="change-period">{{ changePeriod }}</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from './DashboardCard.vue';

interface Props {
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverable?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  icon: string;
  iconBackground?: string;
  value: string | number;
  label: string;
  change?: number;
  changePeriod?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true,
  loading: false,
  iconBackground: 'var(--bl-blue)',
  changePeriod: 'vs last period'
});
</script>

<style scoped>
.stats-card {
  height: 100%;
}

.stats-card__container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stats-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  color: white;
}

.stats-card__icon .material-symbols-outlined {
  font-size: 1.75rem;
}

.stats-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stats-card__value {
  font-size: var(--bl-font-size-2xl);
  font-weight: var(--bl-font-weight-bold);
  color: var(--bl-text-primary);
  line-height: 1.2;
}

.stats-card__label {
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-secondary);
}

.stats-card__change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--bl-font-size-xs);
  margin-top: 0.25rem;
  color: var(--bl-text-secondary);
}

.stats-card__change--positive {
  color: var(--bl-success);
}

.stats-card__change--negative {
  color: var(--bl-error);
}

.stats-card__change .material-symbols-outlined {
  font-size: 1rem;
}

.change-period {
  color: var(--bl-text-tertiary);
  margin-left: 0.25rem;
}
</style>
