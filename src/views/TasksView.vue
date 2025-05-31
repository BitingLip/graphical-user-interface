<template>
  <div class="tasks-view space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and manage AI inference tasks across your cluster
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <Button 
          label="Create Task" 
          icon="pi pi-plus" 
          @click="showCreateDialog = true"
          class="w-full sm:w-auto"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="border-l-4 border-l-blue-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ taskStats.total }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            </div>
            <i class="pi pi-list text-3xl text-blue-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-green-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ taskStats.running }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Running</p>
            </div>
            <i class="pi pi-play text-3xl text-green-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-yellow-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ taskStats.pending }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <i class="pi pi-clock text-3xl text-yellow-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-purple-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ taskStats.completed }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <i class="pi pi-check text-3xl text-purple-500"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <template #content>
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText 
                v-model="searchQuery" 
                placeholder="Search tasks..." 
                class="w-full"
              />
            </IconField>
          </div>
          
          <div class="flex gap-2">
            <Dropdown 
              v-model="selectedStatus" 
              :options="statusOptions" 
              placeholder="Filter by Status"
              optionLabel="label"
              optionValue="value"
              :showClear="true"
              class="w-48"
            />
            
            <Dropdown 
              v-model="selectedModel" 
              :options="modelOptions" 
              placeholder="Filter by Model"
              optionLabel="label"
              optionValue="value"
              :showClear="true"
              class="w-48"
            />
            
            <Button 
              icon="pi pi-refresh" 
              @click="loadTasks" 
              :loading="loading"
              outlined
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Tasks Table -->
    <Card>
      <template #title>Tasks</template>
      <template #content>
        <DataTable 
          :value="filteredTasks" 
          :loading="loading"
          :paginator="true"
          :rows="20"
          :totalRecords="filteredTasks.length"
          selectionMode="single"
          v-model:selection="selectedTask"
          @row-select="onRowSelect"
          class="p-datatable-sm"
          :scrollable="true"
          scrollHeight="600px"
        >
          <Column field="id" header="Task ID" :sortable="true" style="width: 120px">
            <template #body="{ data }">
              <code class="text-xs">{{ data.id.substring(0, 8) }}...</code>
            </template>
          </Column>

          <Column field="type" header="Type" :sortable="true" style="width: 120px">
            <template #body="{ data }">
              <Tag :value="data.type" :severity="getTypeSeverity(data.type)" />
            </template>
          </Column>

          <Column field="status" header="Status" :sortable="true" style="width: 120px">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>

          <Column field="model_id" header="Model" :sortable="true" style="width: 150px">
            <template #body="{ data }">
              <span class="font-medium">{{ getModelName(data.model_id) }}</span>
            </template>
          </Column>

          <Column field="priority" header="Priority" :sortable="true" style="width: 100px">
            <template #body="{ data }">
              <Tag 
                :value="data.priority" 
                :severity="getPrioritySeverity(data.priority)"
                icon="pi pi-flag"
              />
            </template>
          </Column>

          <Column field="progress" header="Progress" style="width: 120px">
            <template #body="{ data }">
              <div v-if="data.status === 'running'" class="flex items-center gap-2">
                <ProgressBar :value="data.progress || 0" :showValue="false" class="flex-1" />
                <span class="text-xs">{{ data.progress || 0 }}%</span>
              </div>
              <span v-else class="text-sm text-gray-500">-</span>
            </template>
          </Column>

          <Column field="worker_id" header="Worker" :sortable="true" style="width: 120px">
            <template #body="{ data }">
              <span v-if="data.worker_id" class="text-sm">{{ data.worker_id.substring(0, 8) }}...</span>
              <span v-else class="text-gray-400">Unassigned</span>
            </template>
          </Column>

          <Column field="created_at" header="Created" :sortable="true" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm">{{ formatDate(data.created_at) }}</span>
            </template>
          </Column>

          <Column field="execution_time" header="Duration" style="width: 100px">
            <template #body="{ data }">
              <span class="text-sm">{{ formatDuration(data.execution_time) }}</span>
            </template>
          </Column>

          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button 
                  icon="pi pi-eye" 
                  size="small" 
                  text 
                  @click="viewTask(data)"
                  v-tooltip="'View Details'"
                />
                <Button 
                  v-if="data.status === 'pending' || data.status === 'running'"
                  icon="pi pi-times" 
                  size="small" 
                  text 
                  severity="danger"
                  @click="cancelTask(data)"
                  v-tooltip="'Cancel Task'"
                />
                <Button 
                  v-if="data.status === 'failed'"
                  icon="pi pi-refresh" 
                  size="small" 
                  text 
                  @click="retryTask(data)"
                  v-tooltip="'Retry Task'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create Task Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Create New Task"
      :style="{ width: '600px' }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="task-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Type
          </label>
          <Dropdown
            id="task-type"
            v-model="newTask.type"
            :options="taskTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Select task type"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="task-model" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model
          </label>
          <Dropdown
            id="task-model"
            v-model="newTask.model_id"
            :options="modelOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select model"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="task-priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <Dropdown
            id="task-priority"
            v-model="newTask.priority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select priority"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="task-cluster" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target Cluster
          </label>
          <Dropdown
            id="task-cluster"
            v-model="newTask.cluster_id"
            :options="clusterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select cluster"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2 md:col-span-2">
          <label for="task-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input Data
          </label>
          <Textarea
            id="task-input"
            v-model="newTask.input_data"
            placeholder="Enter input data (JSON format)..."
            rows="4"
            class="w-full"
          />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="showCreateDialog = false" />
        <Button 
          label="Create Task" 
          @click="createTask"
          :loading="creating"
        />
      </template>
    </Dialog>

    <!-- Task Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      modal
      header="Task Details"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedTask" class="space-y-6">
        <!-- Task Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Task ID</label>
            <code class="text-sm">{{ selectedTask.id }}</code>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Tag :value="selectedTask.status" :severity="getStatusSeverity(selectedTask.status)" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <Tag :value="selectedTask.type" :severity="getTypeSeverity(selectedTask.type)" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <Tag :value="selectedTask.priority" :severity="getPrioritySeverity(selectedTask.priority)" />
          </div>
        </div>

        <!-- Progress -->
        <div v-if="selectedTask.status === 'running'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Progress</label>
          <ProgressBar :value="selectedTask.progress || 0" />
        </div>

        <!-- Input Data -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Data</label>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-32">{{ JSON.stringify(selectedTask.input_data, null, 2) }}</pre>
        </div>

        <!-- Output Data -->
        <div v-if="selectedTask.output_data">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Data</label>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-32">{{ JSON.stringify(selectedTask.output_data, null, 2) }}</pre>
        </div>

        <!-- Error Message -->
        <div v-if="selectedTask.error_message">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Error Message</label>
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
            <p class="text-red-800 dark:text-red-200 text-sm">{{ selectedTask.error_message }}</p>
          </div>
        </div>

        <!-- Metadata -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</label>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Created:</span> {{ formatDate(selectedTask.created_at) }}
            </div>
            <div>
              <span class="font-medium">Updated:</span> {{ selectedTask.updated_at ? formatDate(selectedTask.updated_at) : 'N/A' }}
            </div>
            <div>
              <span class="font-medium">Execution Time:</span> {{ formatDuration(selectedTask.execution_time) }}
            </div>
            <div v-if="selectedTask.worker_id">
              <span class="font-medium">Worker:</span> {{ selectedTask.worker_id }}
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Close" @click="showDetailsDialog = false" />
        <Button 
          v-if="selectedTask?.status === 'pending' || selectedTask?.status === 'running'"
          label="Cancel Task" 
          severity="danger"
          @click="cancelTask(selectedTask)"
        />
        <Button 
          v-if="selectedTask?.status === 'failed'"
          label="Retry Task" 
          @click="retryTask(selectedTask)"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/tasks'
import { useModelStore } from '@/stores/models'
import { useClusterStore } from '@/stores/cluster'
import { useUIStore } from '@/stores/ui'
import type { Task, TaskType, TaskStatus } from '@/types'
import { TaskPriority } from '@/types'
import type { CreateTaskParams } from '@/services/tasks'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

// Router and stores
const router = useRouter()
const tasksStore = useTaskStore()
const modelsStore = useModelStore()
const clusterStore = useClusterStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const creating = ref(false)
const searchQuery = ref('')
const selectedStatus = ref<TaskStatus | null>(null)
const selectedModel = ref<string | null>(null)
const selectedTask = ref<Task | null>(null)
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)

const newTask = ref({
  type: '' as TaskType,
  model_id: '',
  priority: TaskPriority.MEDIUM,
  cluster_id: '',
  input_data: ''
})

// Computed
const tasks = computed(() => [...tasksStore.tasks])
const models = computed(() => [...modelsStore.models])
const clusters = computed(() => [...clusterStore.clusters])

const taskStats = computed(() => {
  const total = tasks.value.length
  const running = tasks.value.filter(t => t.status === 'running').length
  const pending = tasks.value.filter(t => t.status === 'pending').length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const failed = tasks.value.filter(t => t.status === 'failed').length
  
  return { total, running, pending, completed, failed }
})

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.id.toLowerCase().includes(query) ||
      task.type.toLowerCase().includes(query) ||
      getModelName(task.model_id).toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(task => task.status === selectedStatus.value)
  }

  if (selectedModel.value) {
    filtered = filtered.filter(task => task.model_id === selectedModel.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

// Options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const modelOptions = computed(() => [
  { label: 'All Models', value: null },
  ...models.value.map(model => ({
    label: model.name,
    value: model.id
  }))
])

const clusterOptions = computed(() => 
  clusters.value.map(cluster => ({
    label: cluster.name,
    value: cluster.id
  }))
)

const taskTypes = [
  { label: 'Text Generation', value: 'text-generation' },
  { label: 'Text to Image', value: 'text-to-image' },
  { label: 'Image to Text', value: 'image-to-text' },
  { label: 'Audio to Text', value: 'audio-to-text' },
  { label: 'Text to Audio', value: 'text-to-audio' },
  { label: 'Embedding', value: 'embedding' },
  { label: 'Classification', value: 'classification' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' }
]

// Methods
function getStatusSeverity(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'info'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'danger'
    case 'cancelled':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getTypeSeverity(type: TaskType): string {
  switch (type) {
    case 'text-generation':
      return 'info'
    case 'text-to-image':
      return 'success'
    case 'image-to-text':
      return 'warning'
    default:
      return 'secondary'
  }
}

function getPrioritySeverity(priority: TaskPriority): string {
  switch (priority) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getModelName(modelId: string): string {
  const model = models.value.find(m => m.id === modelId)
  return model?.name || 'Unknown Model'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '-'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

function onRowSelect(event: any) {
  selectedTask.value = event.data
}

function viewTask(task: Task) {
  selectedTask.value = task
  showDetailsDialog.value = true
}

async function createTask() {
  if (!newTask.value.type || !newTask.value.model_id) {
    uiStore.showErrorToast('Error', 'Please fill in all required fields')
    return
  }

  let inputData
  try {
    inputData = newTask.value.input_data ? JSON.parse(newTask.value.input_data) : {}
  } catch (error) {
    uiStore.showErrorToast('Error', 'Invalid JSON format in input data')
    return
  }

  creating.value = true
  try {    await tasksStore.createTask({
      type: newTask.value.type,
      modelId: newTask.value.model_id,
      priority: newTask.value.priority,
      parameters: { clusterId: newTask.value.cluster_id }
    })
    
    uiStore.showSuccessToast('Success', 'Task created successfully')
    showCreateDialog.value = false
      // Reset form
    newTask.value = {
      type: '' as TaskType,
      model_id: '',
      priority: TaskPriority.MEDIUM,
      cluster_id: '',
      input_data: ''
    }
    
    await loadTasks()
  } catch (error) {
    console.error('Failed to create task:', error)
    uiStore.showErrorToast('Error', 'Failed to create task')
  } finally {
    creating.value = false
  }
}

async function cancelTask(task: Task) {
  try {
    await tasksStore.cancelTask(task.id)
    uiStore.showSuccessToast('Success', `Task ${task.id} cancelled successfully`)
    await loadTasks()
  } catch (error) {
    console.error('Failed to cancel task:', error)
    uiStore.showErrorToast('Error', 'Failed to cancel task')
  }
}

async function retryTask(task: Task) {
  try {
    await tasksStore.retryTask(task.id)
    uiStore.showSuccessToast('Success', `Task ${task.id} retried successfully`)
    await loadTasks()
  } catch (error) {
    console.error('Failed to retry task:', error)
    uiStore.showErrorToast('Error', 'Failed to retry task')
  }
}

async function loadTasks() {
  loading.value = true
  try {
    await tasksStore.fetchTasks()
    await modelsStore.fetchModels()
    await clusterStore.fetchClusters()
  } catch (error) {
    console.error('Failed to load data:', error)
    uiStore.showErrorToast('Error', 'Failed to load data')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-view {
  padding: 1.5rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.75rem 0.5rem;
}

.p-tag {
  font-size: 0.75rem;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
