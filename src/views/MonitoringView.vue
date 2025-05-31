<template>
  <div class="monitoring-view space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Real-time monitoring of your AI cluster infrastructure
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-2">
        <Dropdown 
          v-model="selectedTimeRange" 
          :options="timeRangeOptions" 
          optionLabel="label"
          optionValue="value"
          class="w-32"
        />
        <Button 
          label="Refresh" 
          icon="pi pi-refresh" 
          @click="refreshMetrics"
          :loading="loading"
          outlined
        />
        <Button 
          :label="autoRefresh ? 'Stop Auto' : 'Auto Refresh'" 
          :icon="autoRefresh ? 'pi pi-pause' : 'pi pi-play'"
          @click="toggleAutoRefresh"
          :severity="autoRefresh ? 'warning' : 'success'"
          outlined
        />
      </div>
    </div>

    <!-- System Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="border-l-4 border-l-blue-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemStats.totalClusters }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Active Clusters</p>
              <div class="flex items-center mt-1">
                <i class="pi pi-arrow-up text-green-500 text-xs mr-1"></i>
                <span class="text-xs text-green-600">{{ systemStats.clustersOnline }} online</span>
              </div>
            </div>
            <i class="pi pi-server text-3xl text-blue-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-green-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemStats.totalWorkers }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">GPU Workers</p>
              <div class="flex items-center mt-1">
                <i class="pi pi-check-circle text-green-500 text-xs mr-1"></i>
                <span class="text-xs text-green-600">{{ systemStats.workersOnline }} active</span>
              </div>
            </div>
            <i class="pi pi-microchip text-3xl text-green-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-yellow-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemStats.activeTasks }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Running Tasks</p>
              <div class="flex items-center mt-1">
                <i class="pi pi-clock text-yellow-500 text-xs mr-1"></i>
                <span class="text-xs text-yellow-600">{{ systemStats.pendingTasks }} pending</span>
              </div>
            </div>
            <i class="pi pi-list text-3xl text-yellow-500"></i>
          </div>
        </template>
      </Card>

      <Card class="border-l-4 border-l-purple-500">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemStats.totalGPUMemory }}GB</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total GPU Memory</p>
              <div class="flex items-center mt-1">
                <i class="pi pi-percentage text-purple-500 text-xs mr-1"></i>
                <span class="text-xs text-purple-600">{{ systemStats.gpuUtilization }}% utilized</span>
              </div>
            </div>
            <i class="pi pi-chart-bar text-3xl text-purple-500"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- GPU Utilization Chart -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>GPU Utilization</span>
            <Tag :value="`${averageGPUUtil.toFixed(1)}% avg`" severity="info" />
          </div>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center">
            <Chart 
              v-if="gpuUtilizationData.datasets[0].data.length > 0"
              type="line" 
              :data="gpuUtilizationData" 
              :options="chartOptions"
              class="w-full h-full"
            />
            <div v-else class="text-gray-500 dark:text-gray-400">
              <i class="pi pi-chart-line text-4xl mb-2 block"></i>
              <p>No data available</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Memory Usage Chart -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>Memory Usage</span>
            <Tag :value="`${averageMemoryUtil.toFixed(1)}% avg`" severity="warning" />
          </div>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center">
            <Chart 
              v-if="memoryUsageData.datasets[0].data.length > 0"
              type="line" 
              :data="memoryUsageData" 
              :options="chartOptions"
              class="w-full h-full"
            />
            <div v-else class="text-gray-500 dark:text-gray-400">
              <i class="pi pi-chart-line text-4xl mb-2 block"></i>
              <p>No data available</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Task Throughput Chart -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>Task Throughput</span>
            <Tag :value="`${taskThroughput.toFixed(1)}/min`" severity="success" />
          </div>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center">
            <Chart 
              v-if="taskThroughputData.datasets[0].data.length > 0"
              type="bar" 
              :data="taskThroughputData" 
              :options="barChartOptions"
              class="w-full h-full"
            />
            <div v-else class="text-gray-500 dark:text-gray-400">
              <i class="pi pi-chart-bar text-4xl mb-2 block"></i>
              <p>No data available</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Worker Status Distribution -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>Worker Status</span>
            <Tag :value="`${systemStats.totalWorkers} total`" severity="info" />
          </div>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center">
            <Chart 
              v-if="workerStatusData.datasets[0].data.length > 0"
              type="doughnut" 
              :data="workerStatusData" 
              :options="doughnutChartOptions"
              class="w-full h-full"
            />
            <div v-else class="text-gray-500 dark:text-gray-400">
              <i class="pi pi-chart-pie text-4xl mb-2 block"></i>
              <p>No data available</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Live Worker Grid -->
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>Live Worker Status</span>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">Live</span>
            </div>
            <Button 
              icon="pi pi-external-link" 
              size="small" 
              text
              @click="router.push('/workers')"
              v-tooltip="'View All Workers'"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="worker in liveWorkers" 
            :key="worker.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            :class="getWorkerCardClass(worker.status)"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-sm truncate">{{ worker.name }}</h4>
              <Tag 
                :value="worker.status" 
                :severity="getStatusSeverity(worker.status)"
                class="text-xs"
              />
            </div>
            
            <div class="space-y-2">
              <!-- GPU Utilization -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>GPU Util</span>
                  <span>{{ worker.gpu_info.utilization }}%</span>
                </div>
                <ProgressBar 
                  :value="worker.gpu_info.utilization" 
                  :showValue="false"
                  class="h-1"
                />
              </div>
              
              <!-- Memory Usage -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>Memory</span>
                  <span>{{ (worker.gpu_info.memory_used / worker.gpu_info.memory_total * 100).toFixed(0) }}%</span>
                </div>
                <ProgressBar 
                  :value="worker.gpu_info.memory_used / worker.gpu_info.memory_total * 100" 
                  :showValue="false"
                  class="h-1"
                />
              </div>
              
              <!-- Task Load -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>Tasks</span>
                  <span>{{ worker.current_tasks }}/{{ worker.max_tasks }}</span>
                </div>
                <ProgressBar 
                  :value="worker.current_tasks / worker.max_tasks * 100" 
                  :showValue="false"
                  class="h-1"
                />
              </div>
              
              <!-- Temperature -->
              <div class="flex justify-between text-xs">
                <span>Temp</span>
                <span :class="getTemperatureClass(worker.gpu_info.temperature)">
                  {{ worker.gpu_info.temperature }}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Alerts Panel -->
    <Card v-if="alerts.length > 0">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-yellow-500"></i>
          <span>System Alerts</span>
          <Tag :value="alerts.length.toString()" severity="warning" />
        </div>
      </template>
      <template #content>
        <div class="space-y-3">
          <div 
            v-for="alert in alerts" 
            :key="alert.id"
            class="flex items-start gap-3 p-3 rounded-lg border-l-4"
            :class="getAlertClass(alert.severity)"
          >
            <i 
              :class="getAlertIcon(alert.type)"
              class="text-lg mt-0.5"
            ></i>
            <div class="flex-1">
              <h4 class="font-medium text-sm">{{ alert.title }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ alert.message }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{{ formatDate(alert.timestamp) }}</span>
                <span>{{ alert.source }}</span>
              </div>
            </div>
            <Button 
              icon="pi pi-times" 
              size="small" 
              text 
              @click="dismissAlert(alert.id)"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClusterStore } from '@/stores/cluster'
import { useTaskStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import type { Worker, WorkerStatus } from '@/types'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'

// Router and stores
const router = useRouter()
const clusterStore = useClusterStore()
const tasksStore = useTaskStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const autoRefresh = ref(false)
const selectedTimeRange = ref('1h')
const refreshInterval = ref<NodeJS.Timeout | null>(null)

// Mock data for charts (in real implementation, this would come from stores)
const gpuUtilizationData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'GPU Utilization %',
    data: [] as number[],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const memoryUsageData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Memory Usage %',
    data: [] as number[],
    borderColor: 'rgb(245, 158, 11)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    tension: 0.4
  }]
})

const taskThroughputData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Tasks/min',
    data: [] as number[],
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderColor: 'rgb(34, 197, 94)',
    borderWidth: 1
  }]
})

const workerStatusData = ref({
  labels: ['Online', 'Busy', 'Offline', 'Error'],
  datasets: [{
    data: [0, 0, 0, 0],
    backgroundColor: [
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(107, 114, 128, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ],
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
})

// Mock alerts
const alerts = ref([
  {
    id: '1',
    type: 'performance',
    severity: 'warning',
    title: 'High GPU Temperature',
    message: 'Worker gpu-node-01 temperature reached 85°C',
    source: 'gpu-node-01',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'resource',
    severity: 'info',
    title: 'Memory Usage Alert',
    message: 'Cluster main-cluster memory usage above 80%',
    source: 'main-cluster',
    timestamp: new Date(Date.now() - 300000).toISOString()
  }
])

// Computed
const workers = computed(() => [...clusterStore.workers])
const clusters = computed(() => [...clusterStore.clusters])
const tasks = computed(() => [...tasksStore.tasks])

const systemStats = computed(() => {
  const totalClusters = clusters.value.length
  const clustersOnline = clusters.value.filter(c => c.status === 'online').length
  const totalWorkers = workers.value.length
  const workersOnline = workers.value.filter(w => w.status === 'online').length
  const activeTasks = tasks.value.filter(t => t.status === 'running').length
  const pendingTasks = tasks.value.filter(t => t.status === 'pending').length
  const totalGPUMemory = Math.round(workers.value.reduce((sum, w) => sum + w.gpu_info.memory_total, 0) / (1024 ** 3))
  const usedGPUMemory = workers.value.reduce((sum, w) => sum + w.gpu_info.memory_used, 0)
  const totalGPUMemoryBytes = workers.value.reduce((sum, w) => sum + w.gpu_info.memory_total, 0)
  const gpuUtilization = totalGPUMemoryBytes > 0 ? Math.round((usedGPUMemory / totalGPUMemoryBytes) * 100) : 0
  
  return {
    totalClusters,
    clustersOnline,
    totalWorkers,
    workersOnline,
    activeTasks,
    pendingTasks,
    totalGPUMemory,
    gpuUtilization
  }
})

const liveWorkers = computed(() => workers.value.slice(0, 8)) // Show first 8 workers

const averageGPUUtil = computed(() => {
  if (workers.value.length === 0) return 0
  const total = workers.value.reduce((sum, w) => sum + w.gpu_info.utilization, 0)
  return total / workers.value.length
})

const averageMemoryUtil = computed(() => {
  if (workers.value.length === 0) return 0
  const total = workers.value.reduce((sum, w) => sum + (w.gpu_info.memory_used / w.gpu_info.memory_total * 100), 0)
  return total / workers.value.length
})

const taskThroughput = computed(() => {
  // Mock calculation - in real implementation, this would be calculated from task completion rate
  return 12.5
})

// Options
const timeRangeOptions = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' }
]

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

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

function getWorkerCardClass(status: WorkerStatus): string {
  switch (status) {
    case 'online':
      return 'border-green-200 bg-green-50 dark:bg-green-900/20'
    case 'busy':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
    case 'offline':
      return 'border-gray-200 bg-gray-50 dark:bg-gray-800'
    case 'error':
      return 'border-red-200 bg-red-50 dark:bg-red-900/20'
    default:
      return 'border-gray-200 bg-gray-50 dark:bg-gray-800'
  }
}

function getTemperatureClass(temp: number): string {
  if (temp > 80) return 'text-red-600'
  if (temp > 70) return 'text-yellow-600'
  return 'text-green-600'
}

function getAlertClass(severity: string): string {
  switch (severity) {
    case 'error':
      return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    case 'warning':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    case 'info':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    default:
      return 'border-gray-500 bg-gray-50 dark:bg-gray-800'
  }
}

function getAlertIcon(type: string): string {
  switch (type) {
    case 'performance':
      return 'pi pi-chart-line text-yellow-500'
    case 'resource':
      return 'pi pi-server text-blue-500'
    case 'error':
      return 'pi pi-exclamation-circle text-red-500'
    default:
      return 'pi pi-info-circle text-gray-500'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function dismissAlert(alertId: string) {
  alerts.value = alerts.value.filter(alert => alert.id !== alertId)
}

async function refreshMetrics() {
  loading.value = true
  try {
    await Promise.all([
      clusterStore.fetchClusters(),
      clusterStore.fetchWorkers(),
      tasksStore.fetchTasks()
    ])
    
    // Update chart data
    updateChartData()
    
    uiStore.showSuccessToast('Success', 'Metrics refreshed')
  } catch (error) {
    console.error('Failed to refresh metrics:', error)
    uiStore.showErrorToast('Error', 'Failed to refresh metrics')
  } finally {
    loading.value = false
  }
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      refreshMetrics()
    }, 30000) // Refresh every 30 seconds
    uiStore.showSuccessToast('Auto Refresh', 'Auto refresh enabled (30s interval)')
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
    uiStore.showSuccessToast('Auto Refresh', 'Auto refresh disabled')
  }
}

function updateChartData() {
  // Update worker status data
  const statusCounts = [0, 0, 0, 0] // online, busy, offline, error
  workers.value.forEach(worker => {
    switch (worker.status) {
      case 'online':
        statusCounts[0]++
        break
      case 'busy':
        statusCounts[1]++
        break
      case 'offline':
        statusCounts[2]++
        break
      case 'error':
        statusCounts[3]++
        break
    }
  })
  workerStatusData.value.datasets[0].data = statusCounts

  // Generate mock time series data for other charts
  const now = new Date()
  const labels = []
  const gpuData = []
  const memoryData = []
  const taskData = []
  
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000) // 5-minute intervals
    labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    
    // Generate realistic mock data based on current worker stats
    gpuData.push(Math.max(0, averageGPUUtil.value + (Math.random() - 0.5) * 20))
    memoryData.push(Math.max(0, averageMemoryUtil.value + (Math.random() - 0.5) * 15))
    taskData.push(Math.round(Math.max(0, taskThroughput.value + (Math.random() - 0.5) * 8)))
  }
  
  gpuUtilizationData.value.labels = labels
  gpuUtilizationData.value.datasets[0].data = gpuData
  
  memoryUsageData.value.labels = labels
  memoryUsageData.value.datasets[0].data = memoryData
  
  taskThroughputData.value.labels = labels
  taskThroughputData.value.datasets[0].data = taskData
}

// Lifecycle
onMounted(() => {
  refreshMetrics()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.monitoring-view {
  padding: 1.5rem;
}

.p-chart {
  position: relative;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.p-progressbar {
  height: 0.25rem;
}

.p-progressbar .p-progressbar-value {
  border-radius: 0.125rem;
}
</style>
