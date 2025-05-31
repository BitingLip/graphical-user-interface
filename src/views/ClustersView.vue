<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Clusters</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your GPU clusters and compute nodes</p>
      </div>
      <Button 
        label="Add Cluster" 
        icon="pi pi-plus" 
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <i class="pi pi-server text-green-600 dark:text-green-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clusters</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clusterStats.total }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-800">
              <i class="pi pi-check-circle text-blue-600 dark:text-blue-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clusterStats.online }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800">
              <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Degraded</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clusterStats.degraded }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <i class="pi pi-times-circle text-gray-600 dark:text-gray-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clusterStats.offline }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Clusters Table -->
    <Card>
      <template #title>Cluster Overview</template>
      <template #content>
        <DataTable 
          :value="clusters" 
          :loading="loading"
          :paginator="true"
          :rows="10"
          :totalRecords="clusters.length"
          selectionMode="single"
          v-model:selection="selectedCluster"
          @row-select="onRowSelect"
          class="p-datatable-sm"
        >
          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-green-500': data.status === 'online',
                    'bg-yellow-500': data.status === 'degraded',
                    'bg-red-500': data.status === 'offline',
                    'bg-gray-500': data.status === 'maintenance'
                  }"
                ></div>
                <span class="font-medium">{{ data.name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <Tag 
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>
          
          <Column field="worker_count" header="Workers" sortable>
            <template #body="{ data }">
              {{ data.active_workers }}/{{ data.worker_count }}
            </template>
          </Column>
          
          <Column field="total_gpu_memory" header="GPU Memory" sortable>
            <template #body="{ data }">
              <div class="space-y-1">
                <div class="text-sm">
                  {{ formatMemory(data.available_gpu_memory) }} / {{ formatMemory(data.total_gpu_memory) }}
                </div>
                <ProgressBar 
                  :value="((data.total_gpu_memory - data.available_gpu_memory) / data.total_gpu_memory) * 100"
                  class="h-2"
                />
              </div>
            </template>
          </Column>
          
          <Column field="cpu_usage" header="CPU Usage" sortable>
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <ProgressBar :value="data.cpu_usage" class="flex-1 h-2" />
                <span class="text-sm">{{ data.cpu_usage }}%</span>
              </div>
            </template>
          </Column>
          
          <Column field="memory_usage" header="Memory Usage" sortable>
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <ProgressBar :value="data.memory_usage" class="flex-1 h-2" />
                <span class="text-sm">{{ data.memory_usage }}%</span>
              </div>
            </template>
          </Column>
          
          <Column field="updated_at" header="Last Update" sortable>
            <template #body="{ data }">
              {{ formatDate(data.updated_at) }}
            </template>
          </Column>
          
          <Column header="Actions">
            <template #body="{ data }">
              <div class="flex space-x-2">
                <Button
                  icon="pi pi-eye"
                  size="small"
                  text
                  @click="viewCluster(data)"
                  v-tooltip.top="'View Details'"
                />
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  text
                  @click="editCluster(data)"
                  v-tooltip.top="'Edit'"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  text
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Delete'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create Cluster Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Add New Cluster"
      :style="{ width: '600px' }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="cluster-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cluster Name
          </label>
          <InputText
            id="cluster-name"
            v-model="newCluster.name"
            placeholder="Enter cluster name"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label for="cluster-endpoint" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Endpoint URL
          </label>
          <InputText
            id="cluster-endpoint"
            v-model="newCluster.endpoint"
            placeholder="http://cluster.example.com:8080"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2 md:col-span-2">
          <label for="cluster-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            id="cluster-description"
            v-model="newCluster.description"
            placeholder="Cluster description..."
            rows="3"
            class="w-full"
          />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="showCreateDialog = false" />
        <Button 
          label="Create Cluster" 
          @click="createCluster"
          :loading="creating"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      modal
      header="Confirm Delete"
      :style="{ width: '400px' }"
    >
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3"></i>
        <span>Are you sure you want to delete cluster "{{ clusterToDelete?.name }}"?</span>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="showDeleteDialog = false" />
        <Button 
          label="Delete" 
          severity="danger"
          @click="deleteCluster"
          :loading="deleting"
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
import type { Cluster } from '@/types'

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

// Router and stores
const router = useRouter()
const clusterStore = useClusterStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const creating = ref(false)
const deleting = ref(false)
const selectedCluster = ref<Cluster | null>(null)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const clusterToDelete = ref<Cluster | null>(null)

const newCluster = ref({
  name: '',
  endpoint: '',
  description: ''
})

// Computed
const clusters = computed(() => [...clusterStore.clusters])

const clusterStats = computed(() => {
  const total = clusters.value.length
  const online = clusters.value.filter(c => c.status === 'online').length
  const degraded = clusters.value.filter(c => c.status === 'degraded').length
  const offline = clusters.value.filter(c => c.status === 'offline').length
  
  return { total, online, degraded, offline }
})

// Methods
function getStatusSeverity(status: string) {
  switch (status) {
    case 'online':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'offline':
      return 'danger'
    case 'maintenance':
      return 'info'
    default:
      return 'secondary'
  }
}

function formatMemory(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function onRowSelect(event: any) {
  // Handle row selection
  console.log('Selected cluster:', event.data)
}

function viewCluster(cluster: Cluster) {
  router.push(`/clusters/${cluster.id}`)
}

function editCluster(cluster: Cluster) {
  router.push(`/clusters/${cluster.id}/edit`)
}

function confirmDelete(cluster: Cluster) {
  clusterToDelete.value = cluster
  showDeleteDialog.value = true
}

async function createCluster() {
  if (!newCluster.value.name) {
    uiStore.showErrorToast('Error', 'Please fill in all required fields')
    return
  }

  creating.value = true
  try {
    await clusterStore.createCluster({
      name: newCluster.value.name
    })
    
    uiStore.showSuccessToast('Success', 'Cluster created successfully')
    showCreateDialog.value = false
    
    // Reset form
    newCluster.value = {
      name: '',
      endpoint: '',
      description: ''
    }
    
    // Refresh clusters
    await loadClusters()
  } catch (error) {
    console.error('Failed to create cluster:', error)
    uiStore.showErrorToast('Error', 'Failed to create cluster')
  } finally {
    creating.value = false
  }
}

async function deleteCluster() {
  if (!clusterToDelete.value) return

  deleting.value = true
  try {
    await clusterStore.deleteCluster(clusterToDelete.value.id)
    uiStore.showSuccessToast('Success', 'Cluster deleted successfully')
    showDeleteDialog.value = false
    clusterToDelete.value = null
    
    // Refresh clusters
    await loadClusters()
  } catch (error) {
    console.error('Failed to delete cluster:', error)
    uiStore.showErrorToast('Error', 'Failed to delete cluster')
  } finally {
    deleting.value = false
  }
}

async function loadClusters() {
  loading.value = true
  try {
    await clusterStore.fetchClusters()
  } catch (error) {
    console.error('Failed to load clusters:', error)
    uiStore.showErrorToast('Error', 'Failed to load clusters')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadClusters()
})
</script>

<style scoped>
.p-progressbar {
  height: 0.5rem;
}

.p-datatable {
  font-size: 0.875rem;
}

.p-datatable .p-datatable-thead > tr > th {
  padding: 0.75rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.75rem;
}
</style>
