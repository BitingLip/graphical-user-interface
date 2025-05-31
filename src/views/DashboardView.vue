<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">AI GPU Cluster Overview</p>
      </div>
      <div class="flex space-x-3">
        <Button 
          icon="pi pi-refresh" 
          class="p-button-outlined" 
          @click="refreshData"
          :loading="loading"
        />
        <Button 
          icon="pi pi-cog" 
          label="Settings" 
          class="p-button-outlined"
        />
      </div>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Clusters -->
      <Card class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Total Clusters</p>
              <p class="text-2xl font-bold">{{ clusterStats.total || 0 }}</p>
            </div>
            <i class="pi pi-server text-3xl text-blue-200"></i>
          </div>
        </template>
      </Card>

      <!-- Active Workers -->
      <Card class="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Active Workers</p>
              <p class="text-2xl font-bold">{{ workerStats.active || 0 }}</p>
            </div>
            <i class="pi pi-desktop text-3xl text-green-200"></i>
          </div>
        </template>
      </Card>

      <!-- Running Tasks -->
      <Card class="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Running Tasks</p>
              <p class="text-2xl font-bold">{{ taskStats.running || 0 }}</p>
            </div>
            <i class="pi pi-play text-3xl text-purple-200"></i>
          </div>
        </template>
      </Card>

      <!-- Available Models -->
      <Card class="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">Available Models</p>
              <p class="text-2xl font-bold">{{ modelStats.available || 0 }}</p>
            </div>
            <i class="pi pi-microchip text-3xl text-orange-200"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- System Status -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Cluster Status -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <span>Cluster Status</span>
              <Button 
                icon="pi pi-external-link" 
                class="p-button-text p-button-sm"
                @click="$router.push('/clusters')"
              />
            </div>
          </template>
          <template #content>
            <div v-if="clusters.length === 0" class="text-center py-8">
              <i class="pi pi-server text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-600 dark:text-gray-400">No clusters available</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="cluster in clusters.slice(0, 3)" 
                :key="cluster.id"
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-3 h-3 rounded-full"                    :class="{
                      'bg-green-500': cluster.status === 'online',
                      'bg-yellow-500': cluster.status === 'degraded',
                      'bg-red-500': cluster.status === 'offline'
                    }"
                  ></div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ cluster.name }}</p>                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ cluster.worker_count }} workers
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ cluster.status }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    Updated {{ formatTime(cluster.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Recent Tasks -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <span>Recent Tasks</span>
              <Button 
                icon="pi pi-external-link" 
                class="p-button-text p-button-sm"
                @click="$router.push('/tasks')"
              />
            </div>
          </template>
          <template #content>
            <div v-if="recentTasks.length === 0" class="text-center py-8">
              <i class="pi pi-list text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-600 dark:text-gray-400">No recent tasks</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="task in recentTasks.slice(0, 5)" 
                :key="task.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-500': task.status === 'completed',
                      'bg-blue-500': task.status === 'running',
                      'bg-yellow-500': task.status === 'pending',
                      'bg-red-500': task.status === 'failed'
                    }"
                  ></div>
                  <div>                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ task.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ formatTime(task.created_at) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': task.status === 'completed',
                      'bg-blue-100 text-blue-800': task.status === 'running',
                      'bg-yellow-100 text-yellow-800': task.status === 'pending',
                      'bg-red-100 text-red-800': task.status === 'failed'
                    }"
                  >
                    {{ task.status }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <Card>
          <template #title>Quick Actions</template>
          <template #content>
            <div class="space-y-3">
              <Button 
                label="Create Task" 
                icon="pi pi-plus" 
                class="w-full p-button-outlined"
                @click="$router.push('/tasks/create')"
              />
              <Button 
                label="Add Model" 
                icon="pi pi-upload" 
                class="w-full p-button-outlined"
                @click="$router.push('/models/upload')"
              />
              <Button 
                label="Monitor Workers" 
                icon="pi pi-eye" 
                class="w-full p-button-outlined"
                @click="$router.push('/workers')"
              />
            </div>
          </template>
        </Card>

        <!-- System Health -->
        <Card>
          <template #title>System Health</template>
          <template #content>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <span class="text-sm font-medium">{{ systemHealth.cpu || 0 }}%</span>
              </div>
              <ProgressBar :value="systemHealth.cpu || 0" />
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span class="text-sm font-medium">{{ systemHealth.memory || 0 }}%</span>
              </div>
              <ProgressBar :value="systemHealth.memory || 0" />
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">GPU Usage</span>
                <span class="text-sm font-medium">{{ systemHealth.gpu || 0 }}%</span>
              </div>
              <ProgressBar :value="systemHealth.gpu || 0" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClusterStore } from '@/stores/cluster'
import { useTaskStore } from '@/stores/tasks'
import { useModelStore } from '@/stores/models'
import { useUIStore } from '@/stores/ui'
import type { Cluster, Task } from '@/types'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'

// Stores
const clusterStore = useClusterStore()
const taskStore = useTaskStore()
const modelStore = useModelStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const clusters = ref<Cluster[]>([])
const recentTasks = ref<Task[]>([])
const clusterStats = ref({ total: 0, online: 0, offline: 0 })
const workerStats = ref({ active: 0, total: 0 })
const taskStats = ref({ running: 0, pending: 0, completed: 0 })
const modelStats = ref({ available: 0, total: 0 })
const systemHealth = ref({ cpu: 0, memory: 0, gpu: 0 })

// Methods
function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

async function refreshData() {
  loading.value = true
  
  try {
    // Fetch all data in parallel
    await Promise.all([
      fetchClusters(),
      fetchTasks(),
      fetchModels(),
      fetchSystemHealth()
    ])
  } catch (error) {
    console.error('Error refreshing dashboard data:', error)
    uiStore.showErrorToast('Error', 'Failed to refresh dashboard data')
  } finally {
    loading.value = false
  }
}

async function fetchClusters() {
  await clusterStore.fetchClusters()
  clusters.value = clusterStore.clusters.slice(0, 10)
  
  clusterStats.value = {
    total: clusterStore.clusters.length,
    online: clusterStore.clusters.filter((c: Cluster) => c.status === 'online').length,
    offline: clusterStore.clusters.filter((c: Cluster) => c.status === 'offline').length
  }
  
  const totalWorkers = clusterStore.clusters.reduce((sum: number, cluster: Cluster) => 
    sum + cluster.worker_count, 0
  )
  const activeWorkers = clusterStore.clusters.reduce((sum: number, cluster: Cluster) => 
    sum + cluster.active_workers, 0
  )
  
  workerStats.value = {
    total: totalWorkers,
    active: activeWorkers
  }
}

async function fetchTasks() {
  await taskStore.fetchTasks({ limit: 20 })
  recentTasks.value = [...taskStore.tasks] // Create a mutable copy
  
  await taskStore.fetchQueueStats()
  if (taskStore.queueStats) {
    taskStats.value = {
      running: taskStore.queueStats.running,
      pending: taskStore.queueStats.pending,
      completed: taskStore.queueStats.completed
    }
  }
}

async function fetchModels() {
  await modelStore.fetchModels()
  modelStats.value = {
    total: modelStore.models.length,
    available: modelStore.availableModels.length
  }
}

async function fetchSystemHealth() {
  // This would typically come from an API endpoint
  // For now, we'll simulate some data
  systemHealth.value = {
    cpu: Math.floor(Math.random() * 80) + 10,
    memory: Math.floor(Math.random() * 70) + 20,
    gpu: Math.floor(Math.random() * 90) + 5
  }
}

// Lifecycle
onMounted(async () => {
  uiStore.setPageTitle('Dashboard')
  uiStore.setBreadcrumbs([{ label: 'Dashboard' }])
  
  await refreshData()
})
</script>

<style scoped>
.p-card .p-card-content {
  padding: 1rem;
}

.p-card .p-card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.p-progressbar {
  height: 0.5rem;
}
</style>
