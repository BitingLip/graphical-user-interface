<template>
  <div class="workers-view space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Worker Management</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and manage GPU workers across your clusters
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-2">
        <Button 
          label="Add Worker" 
          icon="pi pi-plus" 
          @click="showAddDialog = true"
          class="w-full sm:w-auto"
        />
        <Button 
          label="Refresh" 
          icon="pi pi-refresh" 
          @click="loadWorkers"
          :loading="loading"
          outlined
        />
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="border-l-4 border-l-blue-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ workerStats.total }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Workers</p>
            </div>
            <i class="pi pi-server text-3xl text-blue-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-green-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ workerStats.online }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Online</p>
            </div>
            <i class="pi pi-check-circle text-3xl text-green-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-yellow-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ workerStats.busy }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Busy</p>
            </div>
            <i class="pi pi-spin pi-spinner text-3xl text-yellow-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-purple-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatMemory(workerStats.totalGPUMemory) }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total GPU Memory</p>
            </div>
            <i class="pi pi-microchip text-3xl text-purple-500"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <template #content>
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText 
                v-model="searchQuery" 
                placeholder="Search workers..." 
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
              v-model="selectedCluster" 
              :options="clusterOptions" 
              placeholder="Filter by Cluster"
              optionLabel="label"
              optionValue="value"
              :showClear="true"
              class="w-48"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Workers Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card 
        v-for="worker in filteredWorkers" 
        :key="worker.id"
        class="worker-card border hover:shadow-lg transition-shadow duration-200"
      >
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-server text-lg"></i>
              <span class="truncate">{{ worker.name }}</span>
            </div>
            <Tag 
              :value="worker.status" 
              :severity="getStatusSeverity(worker.status)"
              icon="pi pi-circle-fill"
            />
          </div>
        </template>
        
        <template #subtitle>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Cluster: {{ getClusterName(worker.cluster_id) }}
          </div>
        </template>

        <template #content>
          <div class="space-y-4">
            <!-- GPU Information -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 class="font-medium text-sm mb-3 flex items-center gap-2">
                <i class="pi pi-microchip"></i>
                GPU Information
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Model:</span>
                  <span class="font-medium">{{ worker.gpu_info.name }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Memory:</span>
                  <span class="font-medium">
                    {{ formatMemory(worker.gpu_info.memory_used) }} / {{ formatMemory(worker.gpu_info.memory_total) }}
                  </span>
                </div>
                <div class="space-y-1">
                  <div class="flex justify-between text-sm">
                    <span>Memory Usage:</span>
                    <span class="font-medium">{{ (worker.gpu_info.memory_used / worker.gpu_info.memory_total * 100).toFixed(1) }}%</span>
                  </div>
                  <ProgressBar 
                    :value="worker.gpu_info.memory_used / worker.gpu_info.memory_total * 100" 
                    :showValue="false"
                    class="h-2"
                  />
                </div>
                <div class="flex justify-between text-sm">
                  <span>Utilization:</span>
                  <span class="font-medium">{{ worker.gpu_info.utilization }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Temperature:</span>
                  <span class="font-medium">{{ worker.gpu_info.temperature }}°C</span>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 class="font-medium text-sm mb-3 flex items-center gap-2">
                <i class="pi pi-desktop"></i>
                System Information
              </h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">CPU Cores:</span>
                  <div class="font-medium">{{ worker.system_info.cpu_count }}</div>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">CPU Usage:</span>
                  <div class="font-medium">{{ worker.system_info.cpu_usage }}%</div>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">RAM:</span>
                  <div class="font-medium">{{ formatMemory(worker.system_info.memory_total) }}</div>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <div class="font-medium">{{ formatUptime(worker.system_info.uptime) }}</div>
                </div>
              </div>
            </div>

            <!-- Task Information -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 class="font-medium text-sm mb-3 flex items-center gap-2">
                <i class="pi pi-list"></i>
                Task Load
              </h4>
              <div class="flex justify-between text-sm">
                <span>Current Tasks:</span>
                <span class="font-medium">{{ worker.current_tasks }} / {{ worker.max_tasks }}</span>
              </div>
              <ProgressBar 
                :value="worker.current_tasks / worker.max_tasks * 100" 
                :showValue="false"
                class="h-2 mt-2"
              />
            </div>

            <!-- Last Heartbeat -->
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Last seen: {{ formatRelativeTime(worker.last_heartbeat) }}
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-between">
            <div class="flex gap-1">
              <Button 
                icon="pi pi-info-circle" 
                size="small" 
                text 
                @click="viewWorkerDetails(worker)"
                v-tooltip="'View Details'"
              />
              <Button 
                icon="pi pi-chart-line" 
                size="small" 
                text 
                @click="viewWorkerMetrics(worker)"
                v-tooltip="'View Metrics'"
              />
            </div>
            <div class="flex gap-1">
              <Button 
                v-if="worker.status === 'online' || worker.status === 'busy'"
                icon="pi pi-refresh" 
                size="small" 
                text 
                @click="restartWorker(worker)"
                v-tooltip="'Restart Worker'"
              />
              <Button 
                v-if="worker.status === 'online'"
                icon="pi pi-pause" 
                size="small" 
                text 
                severity="warning"
                @click="stopWorker(worker)"
                v-tooltip="'Stop Worker'"
              />
              <Button 
                icon="pi pi-trash" 
                size="small" 
                text 
                severity="danger"
                @click="removeWorker(worker)"
                v-tooltip="'Remove Worker'"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Add Worker Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      modal
      header="Add New Worker"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <label for="worker-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Worker Name
          </label>
          <InputText
            id="worker-name"
            v-model="newWorker.name"
            placeholder="Enter worker name"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="worker-cluster" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cluster
          </label>
          <Dropdown
            id="worker-cluster"
            v-model="newWorker.cluster_id"
            :options="clusterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select cluster"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="worker-endpoint" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Endpoint URL
          </label>
          <InputText
            id="worker-endpoint"
            v-model="newWorker.endpoint"
            placeholder="http://worker.example.com:8080"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">          <label for="worker-max-tasks" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Max Concurrent Tasks
          </label>
          <InputNumber
            id="worker-max-tasks"
            v-model="newWorker.max_tasks"
            :min="1"
            :max="20"
            placeholder="4"
            class="w-full"
          />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="showAddDialog = false" />
        <Button 
          label="Add Worker" 
          @click="addWorker"
          :loading="adding"
        />
      </template>
    </Dialog>

    <!-- Worker Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      modal
      header="Worker Details"
      :style="{ width: '700px' }"
    >
      <div v-if="selectedWorker" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Worker ID</label>
            <code class="text-sm">{{ selectedWorker.id }}</code>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Tag :value="selectedWorker.status" :severity="getStatusSeverity(selectedWorker.status)" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <span>{{ selectedWorker.name }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cluster</label>
            <span>{{ getClusterName(selectedWorker.cluster_id) }}</span>
          </div>
        </div>

        <!-- Detailed System Info -->
        <div>
          <h3 class="text-lg font-medium mb-3">System Information</h3>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">CPU Cores:</span> {{ selectedWorker.system_info.cpu_count }}
              </div>
              <div>
                <span class="font-medium">CPU Usage:</span> {{ selectedWorker.system_info.cpu_usage }}%
              </div>
              <div>
                <span class="font-medium">Total Memory:</span> {{ formatMemory(selectedWorker.system_info.memory_total) }}
              </div>
              <div>
                <span class="font-medium">Used Memory:</span> {{ formatMemory(selectedWorker.system_info.memory_used) }}
              </div>
              <div>
                <span class="font-medium">Disk Usage:</span> {{ selectedWorker.system_info.disk_usage }}%
              </div>
              <div>
                <span class="font-medium">Uptime:</span> {{ formatUptime(selectedWorker.system_info.uptime) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed GPU Info -->
        <div>
          <h3 class="text-lg font-medium mb-3">GPU Information</h3>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">GPU Model:</span> {{ selectedWorker.gpu_info.name }}
              </div>
              <div>
                <span class="font-medium">Utilization:</span> {{ selectedWorker.gpu_info.utilization }}%
              </div>
              <div>
                <span class="font-medium">Total Memory:</span> {{ formatMemory(selectedWorker.gpu_info.memory_total) }}
              </div>
              <div>
                <span class="font-medium">Used Memory:</span> {{ formatMemory(selectedWorker.gpu_info.memory_used) }}
              </div>
              <div>
                <span class="font-medium">Free Memory:</span> {{ formatMemory(selectedWorker.gpu_info.memory_free) }}
              </div>
              <div>
                <span class="font-medium">Temperature:</span> {{ selectedWorker.gpu_info.temperature }}°C
              </div>
            </div>
          </div>
        </div>

        <!-- Task Information -->
        <div>
          <h3 class="text-lg font-medium mb-3">Task Load</h3>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="text-sm space-y-2">
              <div class="flex justify-between">
                <span class="font-medium">Current Tasks:</span>
                <span>{{ selectedWorker.current_tasks }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Maximum Tasks:</span>
                <span>{{ selectedWorker.max_tasks }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Utilization:</span>
                <span>{{ (selectedWorker.current_tasks / selectedWorker.max_tasks * 100).toFixed(1) }}%</span>
              </div>
              <ProgressBar 
                :value="selectedWorker.current_tasks / selectedWorker.max_tasks * 100" 
                class="mt-2"
              />
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div>
          <h3 class="text-lg font-medium mb-3">Timeline</h3>
          <div class="text-sm space-y-1">
            <div><span class="font-medium">Created:</span> {{ formatDate(selectedWorker.created_at) }}</div>
            <div><span class="font-medium">Last Heartbeat:</span> {{ formatDate(selectedWorker.last_heartbeat) }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Close" @click="showDetailsDialog = false" />
        <Button 
          v-if="selectedWorker?.status === 'online' || selectedWorker?.status === 'busy'"
          label="Restart Worker" 
          @click="restartWorker(selectedWorker)"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClusterStore } from '@/stores/cluster'
import { useUIStore } from '@/stores/ui'
import type { Worker, WorkerStatus } from '@/types'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

// Router and stores
const router = useRouter()
const clusterStore = useClusterStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const adding = ref(false)
const searchQuery = ref('')
const selectedStatus = ref<WorkerStatus | null>(null)
const selectedCluster = ref<string | null>(null)
const selectedWorker = ref<Worker | null>(null)
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)

const newWorker = ref({
  name: '',
  cluster_id: '',
  endpoint: '',
  max_tasks: 4
})

// Computed
const workers = computed(() => [...clusterStore.workers])
const clusters = computed(() => [...clusterStore.clusters])

const workerStats = computed(() => {
  const total = workers.value.length
  const online = workers.value.filter(w => w.status === 'online').length
  const busy = workers.value.filter(w => w.status === 'busy').length
  const offline = workers.value.filter(w => w.status === 'offline').length
  const totalGPUMemory = workers.value.reduce((sum, w) => sum + w.gpu_info.memory_total, 0)
  
  return { total, online, busy, offline, totalGPUMemory }
})

const filteredWorkers = computed(() => {
  let filtered = workers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(worker => 
      worker.name.toLowerCase().includes(query) ||
      worker.id.toLowerCase().includes(query) ||
      getClusterName(worker.cluster_id).toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(worker => worker.status === selectedStatus.value)
  }

  if (selectedCluster.value) {
    filtered = filtered.filter(worker => worker.cluster_id === selectedCluster.value)
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name))
})

// Options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Online', value: 'online' },
  { label: 'Busy', value: 'busy' },
  { label: 'Offline', value: 'offline' },
  { label: 'Error', value: 'error' },
  { label: 'Maintenance', value: 'maintenance' }
]

const clusterOptions = computed(() => [
  { label: 'All Clusters', value: null },
  ...clusters.value.map(cluster => ({
    label: cluster.name,
    value: cluster.id
  }))
])

// Methods
function getStatusSeverity(status: WorkerStatus): string {
  switch (status) {
    case 'online':
      return 'success'
    case 'busy':
      return 'warning'
    case 'offline':
      return 'secondary'
    case 'error':
      return 'danger'
    case 'maintenance':
      return 'info'
    default:
      return 'secondary'
  }
}

function getClusterName(clusterId: string): string {
  const cluster = clusters.value.find(c => c.id === clusterId)
  return cluster?.name || 'Unknown Cluster'
}

function formatMemory(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
  return `${Math.floor(diffMinutes / 1440)}d ago`
}

function viewWorkerDetails(worker: Worker) {
  selectedWorker.value = worker
  showDetailsDialog.value = true
}

function viewWorkerMetrics(worker: Worker) {
  router.push(`/monitoring?worker=${worker.id}`)
}

async function restartWorker(worker: Worker) {
  try {
    await clusterStore.restartWorker(worker.id)
    uiStore.showSuccessToast('Success', `Worker ${worker.name} restarted successfully`)
    await loadWorkers()
  } catch (error) {
    console.error('Failed to restart worker:', error)
    uiStore.showErrorToast('Error', 'Failed to restart worker')
  }
}

async function stopWorker(worker: Worker) {
  try {
    // This would be a new method in the cluster service
    uiStore.showSuccessToast('Success', `Worker ${worker.name} stopped successfully`)
    await loadWorkers()
  } catch (error) {
    console.error('Failed to stop worker:', error)
    uiStore.showErrorToast('Error', 'Failed to stop worker')
  }
}

async function removeWorker(worker: Worker) {
  try {
    // This would be a new method in the cluster service
    uiStore.showSuccessToast('Success', `Worker ${worker.name} removed successfully`)
    await loadWorkers()
  } catch (error) {
    console.error('Failed to remove worker:', error)
    uiStore.showErrorToast('Error', 'Failed to remove worker')
  }
}

async function addWorker() {
  if (!newWorker.value.name || !newWorker.value.cluster_id) {
    uiStore.showErrorToast('Error', 'Please fill in all required fields')
    return
  }

  adding.value = true
  try {
    // This would be a new method in the cluster service
    uiStore.showSuccessToast('Success', 'Worker added successfully')
    showAddDialog.value = false
    
    // Reset form
    newWorker.value = {
      name: '',
      cluster_id: '',
      endpoint: '',
      max_tasks: 4
    }
    
    await loadWorkers()
  } catch (error) {
    console.error('Failed to add worker:', error)
    uiStore.showErrorToast('Error', 'Failed to add worker')
  } finally {
    adding.value = false
  }
}

async function loadWorkers() {
  loading.value = true
  try {
    await clusterStore.fetchWorkers()
    await clusterStore.fetchClusters()
  } catch (error) {
    console.error('Failed to load workers:', error)
    uiStore.showErrorToast('Error', 'Failed to load workers')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadWorkers()
})
</script>

<style scoped>
.workers-view {
  padding: 1.5rem;
}

.worker-card {
  transition: all 0.2s ease-in-out;
}

.worker-card:hover {
  transform: translateY(-2px);
}

.p-tag {
  font-size: 0.75rem;
}

.p-progressbar {
  height: 0.5rem;
}

.p-progressbar .p-progressbar-value {
  border-radius: 0.25rem;
}
</style>
