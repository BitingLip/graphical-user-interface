<template>
  <div class="composite-data-table">
    <div class="composite-data-table__header">
      <div class="composite-data-table__header-left">
        <ElementBadge v-if="totalItems !== undefined">
          Total ({{ totalItems }})
        </ElementBadge>
        <ElementBadge v-if="perPage">
          Page Size {{ perPage }}
        </ElementBadge>
        <ElementBadge v-if="currentPage !== undefined && totalPages !== undefined">
          Page {{ currentPage }} of {{ totalPages }}
        </ElementBadge>
      </div>
      <div class="composite-data-table__header-right">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="composite-data-table__body">
      <table class="composite-data-table__table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :style="{ width: column.width }"
            >
              {{ column.label }}
              <span 
                v-if="column.sortable" 
                class="material-symbols-outlined sort-icon"
                @click="handleSort(column.key)"
              >
                {{ getSortIcon(column.key) }}
              </span>
            </th>
            <th v-if="$slots.rowActions" class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody :class="{ 'empty-body': isLoading || items.length === 0 }">
          <tr v-if="isLoading || items.length === 0" class="message-row">
            <td :colspan="columns.length + ($slots.rowActions ? 1 : 0)">
              <div class="message-container">
                <template v-if="isLoading">
                  <ElementSpinner size="md" text="Loading data..." />
                </template>
                <template v-else-if="items.length === 0">
                  <span class="material-symbols-outlined message-icon">
                    info
                  </span>
                  <span class="message-text">{{ emptyMessage }}</span>
                </template>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr 
              v-for="(item, index) in items" 
              :key="getItemKey(item, index)" 
              @click="handleRowClick(item, index)"
              :class="{ 'clickable-row': !!rowClickEnabled }"
            >
              <td 
                v-for="column in columns"
                :key="`${getItemKey(item, index)}-${column.key}`"
              >
                <slot :name="`column-${column.key}`" :item="item" :index="index">
                  {{ getItemValue(item, column.key) }}
                </slot>
              </td>
              <td v-if="$slots.rowActions" class="actions-cell">
                <slot name="rowActions" :item="item" :index="index"></slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    
    <div v-if="showPagination && totalPages > 1" class="composite-data-table__footer">
      <div class="pagination">
        <ElementButton
          variant="secondary"
          size="sm"
          icon="first_page"
          :disabled="currentPage <= 1"
          @click="handlePageChange(1)"
          iconOnly
        />
        <ElementButton
          variant="secondary"
          size="sm"
          icon="chevron_left"
          :disabled="currentPage <= 1"
          @click="handlePageChange(currentPage - 1)"
          iconOnly
        />
        
        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <ElementButton
          variant="secondary"
          size="sm"
          icon="chevron_right"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
          iconOnly
        />
        <ElementButton
          variant="secondary"
          size="sm"
          icon="last_page"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(totalPages)"
          iconOnly
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ElementBadge from '../../elements/ElementBadge.vue';
import ElementButton from '../../elements/ElementButton.vue';
import ElementSpinner from '../../elements/ElementSpinner.vue';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface Props {
  columns: Column[];
  items: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  perPage?: number;
  showPagination?: boolean;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  rowClickEnabled?: boolean;
  keyField?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyMessage: 'No data available',
  showPagination: true,
  rowClickEnabled: false,
  keyField: 'id'
});

const emit = defineEmits<{
  'row-click': [item: any, index: number];
  'page-change': [page: number];
  'sort': [key: string, order: 'asc' | 'desc'];
}>();

const handleRowClick = (item: any, index: number) => {
  if (props.rowClickEnabled) {
    emit('row-click', item, index);
  }
};

const handlePageChange = (page: number) => {
  emit('page-change', page);
};

const handleSort = (key: string) => {
  const newOrder = props.sortKey === key && props.sortOrder === 'asc' ? 'desc' : 'asc';
  emit('sort', key, newOrder);
};

const getSortIcon = (key: string) => {
  if (props.sortKey !== key) return 'sort';
  return props.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
};

const getItemValue = (item: any, key: string) => {
  // Handle nested keys like 'user.name'
  return key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
};

const getItemKey = (item: any, index: number) => {
  return item[props.keyField] || `item-${index}`;
};
</script>

<style scoped>
.composite-data-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bl-border);
  border-radius: 4px;
  background-color: var(--bl-surface);
  box-shadow: var(--bl-shadow-small);
  overflow: hidden;
}

.composite-data-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bl-table-header-bg);
  border-bottom: 1px solid var(--bl-border);
}

.composite-data-table__header-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.composite-data-table__header-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.composite-data-table__body {
  overflow-x: auto;
}

.composite-data-table__table {
  width: 100%;
  border-collapse: collapse;
}

.composite-data-table__table th {
  padding: 0.75rem 1rem;
  font-weight: var(--bl-font-weight-medium);
  color: var(--bl-text-secondary);
  text-align: left;
  border-bottom: 1px solid var(--bl-border);
  position: sticky;
  top: 0;
  background-color: var(--bl-surface);
  white-space: nowrap;
}

.composite-data-table__table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bl-divider);
  color: var(--bl-text-primary);
}

.composite-data-table__table tbody tr:last-child td {
  border-bottom: none;
}

.composite-data-table__table tbody tr:hover {
  background-color: var(--bl-table-row-hover);
}

.sort-icon {
  vertical-align: middle;
  font-size: 16px;
  margin-left: 4px;
  cursor: pointer;
}

.empty-body {
  min-height: 200px;
}

.message-row {
  height: 200px;
}

.message-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.message-icon {
  font-size: 2rem;
  color: var(--bl-text-secondary);
}

.message-text {
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-secondary);
}

.actions-column {
  width: 120px;
  text-align: center;
}

.actions-cell {
  text-align: center;
}

.composite-data-table__footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--bl-border);
  background-color: var(--bl-table-header-bg);
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-info {
  margin: 0 0.5rem;
  font-size: var(--bl-font-size-sm);
  color: var(--bl-text-secondary);
}

.clickable-row {
  cursor: pointer;
}
</style>
