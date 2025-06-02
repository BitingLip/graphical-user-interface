<template>
  <div class="view-tasks">
    <h1 class="view-title">Tasks</h1>
    
    <div class="stats-row">
      <StatsCard
        icon="assignment"
        value="34"
        label="Total Tasks"
        change="8"
        changePeriod="vs last week"
      />
      <StatsCard
        icon="pending_actions"
        iconBackground="var(--bl-warning)"
        value="12"
        label="Pending Tasks"
      />
      <StatsCard
        icon="rocket_launch"
        iconBackground="var(--bl-success)"
        value="18"
        label="Completed Tasks"
        change="5"
      />
      <StatsCard
        icon="error"
        iconBackground="var(--bl-danger)"
        value="4"
        label="Failed Tasks"
        change="2"
        changeDirection="up"
      />
    </div>
    
    <div class="task-actions">
      <ElementButton 
        icon="add"
        variant="primary"
        @click="showNewTaskModal = true"
      >
        New Task
      </ElementButton>
      
      <div class="filter-group">
        <ElementSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Status"
          size="sm"
        />
        
        <ElementSelect
          v-model="typeFilter"
          :options="typeOptions"
          placeholder="Type"
          size="sm"
        />
        
        <ElementInput
          placeholder="Search tasks..."
          prefixIcon="search"
          v-model="searchQuery"
          size="sm"
        />
      </div>
    </div>
    
    <DataTable
      :columns="columns"
      :items="filteredTasks"
      :isLoading="isLoading"
      :totalItems="tasks.length"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :perPage="perPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      @row-click="handleTaskClick"
      @page-change="handlePageChange"
      @sort="handleSort"
      rowClickEnabled
    >
      <template #column-status="{ item }">
        <ElementBadge
          :variant="getStatusVariant(item.status)"
        >
          {{ item.status }}
        </ElementBadge>
      </template>
      
      <template #column-priority="{ item }">
        <ElementBadge
          :variant="getPriorityVariant(item.priority)"
        >
          {{ item.priority }}
        </ElementBadge>
      </template>
      
      <template #column-progress="{ item }">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: item.progress + '%' }"></div>
          <span class="progress-text">{{ item.progress }}%</span>
        </div>
      </template>
      
      <template #rowActions="{ item }">
        <div class="row-actions">
          <ElementButton
            v-if="item.status === 'Pending'"
            variant="ghost"
            icon="play_arrow"
            iconOnly
            title="Run Task"
            @click.stop="handleRunTask(item)"
          />
          <ElementButton
            v-if="['Running', 'Pending'].includes(item.status)"
            variant="ghost"
            icon="stop"
            iconOnly
            title="Stop Task"
            @click.stop="handleStopTask(item)"
          />
          <ElementButton
            variant="ghost"
            icon="more_vert"
            iconOnly
            @click.stop="handleActionsClick(item)"
          />
        </div>
      </template>
    </DataTable>
    
    <!-- New Task Modal -->
    <Modal
      v-model="showNewTaskModal"
      title="Create New Task"
      :loading="isCreating"
      @confirm="handleCreateTask"
    >
      <Form @submit="handleCreateTask">
        <FormFieldGroup
          label="Task Name"
          required
          :error="formErrors.name"
        >
          <ElementInput
            v-model="newTask.name"
            placeholder="Enter task name"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Task Type"
          required
          :error="formErrors.type"
        >
          <ElementSelect
            v-model="newTask.type"
            :options="taskTypes"
            placeholder="Select task type"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Cluster"
          required
          :error="formErrors.cluster"
        >
          <ElementSelect
            v-model="newTask.cluster"
            :options="clusterOptions"
            placeholder="Select cluster"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Priority"
          required
          :error="formErrors.priority"
        >
          <ElementSelect
            v-model="newTask.priority"
            :options="priorityOptions"
            placeholder="Select priority"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Description"
        >
          <ElementInput
            v-model="newTask.description"
            type="textarea"
            placeholder="Enter task description"
            rows="3"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Schedule"
        >
          <ElementToggle
            v-model="newTask.shouldSchedule"
            label="Schedule for later"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          v-if="newTask.shouldSchedule"
          label="Scheduled Time"
          required
          :error="formErrors.scheduledTime"
        >
          <ElementInput
            v-model="newTask.scheduledTime"
            type="datetime-local"
          />
        </FormFieldGroup>
      </Form>
    </Modal>
    
    <!-- Task Details Modal -->
    <Modal
      v-model="showTaskDetailsModal"
      title="Task Details"
      size="lg"
      confirmText="Close"
      showCancel="false"
    >
      <div v-if="selectedTask" class="task-details">
        <div class="task-detail-section">
          <h3>Basic Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ selectedTask.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedTask.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedTask.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <ElementBadge :variant="getStatusVariant(selectedTask.status)">
                  {{ selectedTask.status }}
                </ElementBadge>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Priority:</span>
              <span class="detail-value">
                <ElementBadge :variant="getPriorityVariant(selectedTask.priority)">
                  {{ selectedTask.priority }}
                </ElementBadge>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cluster:</span>
              <span class="detail-value">{{ selectedTask.cluster }}</span>
            </div>
          </div>
        </div>
        
        <div class="task-detail-section">
          <h3>Progress</h3>
          <div class="progress-detail">
            <div class="progress-container large">
              <div class="progress-bar" :style="{ width: selectedTask.progress + '%' }"></div>
              <span class="progress-text">{{ selectedTask.progress }}%</span>
            </div>
          </div>
        </div>
        
        <div class="task-detail-section">
          <h3>Description</h3>
          <p class="task-description">{{ selectedTask.description || 'No description provided' }}</p>
        </div>
        
        <div class="task-detail-section">
          <h3>Timeline</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ selectedTask.createdAt }}</span>
            </div>
            <div class="detail-item" v-if="selectedTask.startedAt">
              <span class="detail-label">Started:</span>
              <span class="detail-value">{{ selectedTask.startedAt }}</span>
            </div>
            <div class="detail-item" v-if="selectedTask.completedAt">
              <span class="detail-label">Completed:</span>
              <span class="detail-value">{{ selectedTask.completedAt }}</span>
            </div>
            <div class="detail-item" v-if="selectedTask.duration">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">{{ selectedTask.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import StatsCard from '../composites/dashboards/StatsCard.vue';
import DataTable from '../composites/tables/DataTable.vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementInput from '../elements/ElementInput.vue';
import ElementBadge from '../elements/ElementBadge.vue';
import ElementSelect from '../elements/ElementSelect.vue';
import ElementToggle from '../elements/ElementToggle.vue';
import Modal from '../composites/modals/Modal.vue';
import Form from '../composites/forms/Form.vue';
import FormFieldGroup from '../composites/forms/FormFieldGroup.vue';

// Tasks data
const isLoading = ref(false);
const tasks = ref([
  { 
    id: 1, 
    name: 'Data Processing Job', 
    type: 'Batch Processing', 
    status: 'Running',
    cluster: 'Production-Main',
    priority: 'High',
    progress: 68,
    description: 'Process latest customer transaction data for analytics.',
    createdAt: '2025-05-25 09:30:12',
    startedAt: '2025-05-25 10:00:00',
    completedAt: null,
    duration: '1h 28m'
  },
  { 
    id: 2, 
    name: 'Database Backup', 
    type: 'Maintenance', 
    status: 'Completed',
    cluster: 'Production-Main',
    priority: 'Medium',
    progress: 100,
    description: 'Weekly database backup task for all production databases.',
    createdAt: '2025-05-24 00:00:00',
    startedAt: '2025-05-24 01:00:00',
    completedAt: '2025-05-24 02:15:30',
    duration: '1h 15m'
  },
  { 
    id: 3, 
    name: 'Model Training', 
    type: 'Machine Learning', 
    status: 'Pending',
    cluster: 'ML-Training',
    priority: 'High',
    progress: 0,
    description: 'Train new recommendation model on latest user data.',
    createdAt: '2025-05-26 12:00:00',
    scheduledTime: '2025-05-27 01:00:00',
    startedAt: null,
    completedAt: null,
    duration: null
  },
  { 
    id: 4, 
    name: 'Log Analysis', 
    type: 'Analytics', 
    status: 'Failed',
    cluster: 'Analytics',
    priority: 'Low',
    progress: 34,
    description: 'Analyze server logs for error patterns and security events.',
    createdAt: '2025-05-25 14:20:00',
    startedAt: '2025-05-25 14:30:00',
    completedAt: '2025-05-25 14:45:23',
    errorMessage: 'Insufficient memory allocation',
    duration: '15m 23s'
  },
  { 
    id: 5, 
    name: 'User Notification', 
    type: 'Communication', 
    status: 'Completed',
    cluster: 'Notification-Service',
    priority: 'Medium',
    progress: 100,
    description: 'Send monthly newsletter to all subscribed users.',
    createdAt: '2025-05-20 08:00:00',
    startedAt: '2025-05-20 09:00:00',
    completedAt: '2025-05-20 09:12:05',
    duration: '12m 5s'
  }
]);

// Table configuration
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = computed(() => Math.ceil(tasks.value.length / perPage.value));
const sortKey = ref('id');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Column definitions
const columns = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'cluster', label: 'Cluster', sortable: true },
  { key: 'progress', label: 'Progress', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true }
];

// Filters
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

// Filter options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Running', label: 'Running' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Failed', label: 'Failed' }
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Batch Processing', label: 'Batch Processing' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Communication', label: 'Communication' }
];

// Task creation
const showNewTaskModal = ref(false);
const isCreating = ref(false);
const newTask = ref({
  name: '',
  type: '',
  cluster: '',
  priority: 'Medium',
  description: '',
  shouldSchedule: false,
  scheduledTime: ''
});
const formErrors = ref({
  name: '',
  type: '',
  cluster: '',
  priority: '',
  scheduledTime: ''
});

// Task types for creation
const taskTypes = [
  { value: 'Batch Processing', label: 'Batch Processing' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Communication', label: 'Communication' }
];

// Priority options
const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
];

// Cluster options
const clusterOptions = [
  { value: 'Production-Main', label: 'Production-Main' },
  { value: 'Staging', label: 'Staging' },
  { value: 'Development', label: 'Development' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'ML-Training', label: 'ML-Training' },
  { value: 'Notification-Service', label: 'Notification-Service' }
];

// Task details modal
const showTaskDetailsModal = ref(false);
const selectedTask = ref<any>(null);

// Filtered tasks
const filteredTasks = computed(() => {
  let filtered = [...tasks.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(search) || 
      task.type.toLowerCase().includes(search) ||
      task.cluster.toLowerCase().includes(search)
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value);
  }
  
  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(task => task.type === typeFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  return filtered;
});

// Utility functions
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Running': return 'info';
    case 'Completed': return 'success';
    case 'Failed': return 'danger';
    case 'Pending': return 'warning';
    default: return 'default';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'High': return 'danger';
    case 'Medium': return 'warning';
    case 'Low': return 'info';
    default: return 'default';
  }
};

// Event handlers
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const handleTaskClick = (task: any) => {
  selectedTask.value = task;
  showTaskDetailsModal.value = true;
};

const handleCreateTask = () => {
  // Reset form errors
  formErrors.value = {
    name: '',
    type: '',
    cluster: '',
    priority: '',
    scheduledTime: ''
  };
  
  // Validate form
  let isValid = true;
  if (!newTask.value.name) {
    formErrors.value.name = 'Task name is required';
    isValid = false;
  }
  if (!newTask.value.type) {
    formErrors.value.type = 'Task type is required';
    isValid = false;
  }
  if (!newTask.value.cluster) {
    formErrors.value.cluster = 'Cluster is required';
    isValid = false;
  }
  if (newTask.value.shouldSchedule && !newTask.value.scheduledTime) {
    formErrors.value.scheduledTime = 'Schedule time is required';
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Create task
  isCreating.value = true;
  
  // Simulate API call
  setTimeout(() => {
    const newId = Math.max(...tasks.value.map(t => t.id)) + 1;
    tasks.value.push({
      id: newId,
      name: newTask.value.name,
      type: newTask.value.type,
      status: newTask.value.shouldSchedule ? 'Pending' : 'Running',
      cluster: newTask.value.cluster,
      priority: newTask.value.priority,
      progress: newTask.value.shouldSchedule ? 0 : 5,
      description: newTask.value.description,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      startedAt: newTask.value.shouldSchedule ? null : new Date().toISOString().replace('T', ' ').substring(0, 19),
      completedAt: null,
      scheduledTime: newTask.value.shouldSchedule ? newTask.value.scheduledTime : null,
      duration: null
    });
    
    isCreating.value = false;
    showNewTaskModal.value = false;
    
    // Reset form
    newTask.value = {
      name: '',
      type: '',
      cluster: '',
      priority: 'Medium',
      description: '',
      shouldSchedule: false,
      scheduledTime: ''
    };
  }, 1000);
};

const handleRunTask = (task: any) => {
  // Simulate starting a task
  const taskIndex = tasks.value.findIndex(t => t.id === task.id);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].status = 'Running';
    tasks.value[taskIndex].startedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    tasks.value[taskIndex].progress = 5;
  }
};

const handleStopTask = (task: any) => {
  // Simulate stopping a task
  const taskIndex = tasks.value.findIndex(t => t.id === task.id);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].status = 'Failed';
    tasks.value[taskIndex].completedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Calculate duration
    const startDate = new Date(tasks.value[taskIndex].startedAt);
    const endDate = new Date(tasks.value[taskIndex].completedAt);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMin = Math.floor(durationMs / 60000);
    const durationSec = Math.floor((durationMs % 60000) / 1000);
    
    tasks.value[taskIndex].duration = `${durationMin}m ${durationSec}s`;
  }
};

const handleActionsClick = (task: any) => {
  // Show context menu or action dialog
  selectedTask.value = task;
  showTaskDetailsModal.value = true;
};
</script>

<style scoped>
.view-tasks {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.view-title {
  font-size: 1.8rem;
  color: var(--bl-text-primary);
  margin-bottom: 1.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.progress-container {
  background-color: var(--bl-background-secondary);
  border-radius: 4px;
  height: 8px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.progress-container.large {
  height: 16px;
  margin: 0.5rem 0;
}

.progress-bar {
  background-color: var(--bl-primary);
  height: 100%;
  transition: width 0.3s ease-in-out;
}

.progress-text {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.75rem;
  line-height: 1;
  padding: 2px 4px;
}

.progress-container.large .progress-text {
  font-size: 0.875rem;
  padding: 0 8px;
  line-height: 16px;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-detail-section {
  border-bottom: 1px solid var(--bl-border);
  padding-bottom: 1rem;
}

.task-detail-section:last-child {
  border-bottom: none;
}

.task-detail-section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--bl-text-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--bl-text-primary);
}

.task-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--bl-text-primary);
  white-space: pre-line;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
