<template>
  <div class="stats-card">
    <div class="stats-icon" :style="{ backgroundColor: iconBackground }">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>
    <div class="stats-content">
      <div class="stats-value">{{ value }}</div>
      <div class="stats-label">{{ label }}</div>
      <div v-if="change !== undefined" class="stats-change">
        <span class="change-arrow" :class="{ positive: isPositiveChange, negative: !isPositiveChange }">
          <span class="material-symbols-outlined">{{ isPositiveChange ? 'arrow_upward' : 'arrow_downward' }}</span>
        </span>
        <span class="change-value">{{ Math.abs(parseFloat(change)) }}%</span>
        <span class="change-period" v-if="changePeriod">{{ changePeriod }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'StatsCard',
  props: {
    icon: {
      type: String,
      default: 'trending_up'
    },
    iconBackground: {
      type: String,
      default: 'var(--bl-primary)'
    },
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    change: {
      type: [String, Number],
      default: undefined
    },
    changePeriod: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isPositiveChange = computed(() => {
      if (props.change === undefined) return true;
      const changeValue = parseFloat(props.change.toString());
      return changeValue >= 0;
    });
    
    return {
      isPositiveChange
    };
  }
});
</script>

<style scoped>
.stats-card {
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stats-icon span {
  font-size: 28px;
  color: white;
}

.stats-content {
  flex-grow: 1;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--bl-text-primary);
  line-height: 1.2;
}

.stats-label {
  color: var(--bl-text-secondary);
  margin-top: 0.25rem;
}

.stats-change {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.change-arrow {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  margin-right: 0.25rem;
}

.change-arrow span {
  font-size: 14px;
}

.change-arrow.positive {
  color: var(--bl-success);
}

.change-arrow.negative {
  color: var(--bl-danger);
}

.change-value {
  font-weight: 600;
  margin-right: 0.25rem;
}

.change-period {
  color: var(--bl-text-tertiary);
}
</style>
