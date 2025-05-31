<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Models</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your AI models and deployments</p>
      </div>
      <div class="flex space-x-2">
        <Button 
          label="Upload Model" 
          icon="pi pi-upload" 
          @click="showUploadDialog = true"
        />
        <Button 
          label="Import from Hub" 
          icon="pi pi-download" 
          outlined
          @click="showImportDialog = true"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-800">
              <i class="pi pi-box text-blue-600 dark:text-blue-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Models</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ modelStats.total }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <i class="pi pi-play text-green-600 dark:text-green-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Deployed</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ modelStats.deployed }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800">
              <i class="pi pi-clock text-yellow-600 dark:text-yellow-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ modelStats.loading }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-800">
              <i class="pi pi-chart-bar text-purple-600 dark:text-purple-300 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ modelStats.totalRuns }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <template #content>
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-64">
            <InputText
              v-model="searchQuery"
              placeholder="Search models..."
              class="w-full"
            />
          </div>
          
          <Dropdown
            v-model="selectedType"
            :options="modelTypes"
            placeholder="All Types"
            class="w-48"
            showClear
          />
          
          <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="All Status"
            class="w-48"
            showClear
          />
          
          <Button
            icon="pi pi-refresh"
            @click="loadModels"
            :loading="loading"
          />
        </div>
      </template>
    </Card>

    <!-- Models Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="model in filteredModels" 
        :key="model.id"
        class="transition-all duration-200 hover:shadow-lg cursor-pointer"
        @click="viewModel(model)"
      >
        <template #title>
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ model.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ model.type }}</p>
            </div>
            <Tag 
              :value="model.status"
              :severity="getModelStatusSeverity(model.status)"
            />
          </div>
        </template>
        
        <template #content>
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ model.description || 'No description available' }}
            </p>
            
            <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center space-x-1">
                <i class="pi pi-database text-xs"></i>
                <span>{{ formatFileSize(model.size || 0) }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <i class="pi pi-calendar text-xs"></i>
                <span>{{ formatDate(model.created_at) }}</span>
              </div>
            </div>
            
            <div v-if="model.metrics" class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Accuracy</span>
                <div class="font-medium">{{ (model.metrics.accuracy * 100).toFixed(1) }}%</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Runs</span>
                <div class="font-medium">{{ model.metrics.total_runs || 0 }}</div>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <Button
                v-if="model.status === 'ready'"
                label="Deploy"
                size="small"
                @click.stop="deployModel(model)"
              />
              <Button
                v-else-if="model.status === 'deployed'"
                label="Undeploy"
                size="small"
                outlined
                @click.stop="undeployModel(model)"
              />
              
              <Button
                label="Test"
                size="small"
                outlined
                @click.stop="testModel(model)"
                :disabled="model.status !== 'deployed'"
              />
              
              <SplitButton
                label="Actions"
                size="small"
                text
                :model="getModelActions(model)"
                @click.stop
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Upload Model Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      modal
      header="Upload Model"
      :style="{ width: '700px' }"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="model-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Model Name *
            </label>
            <InputText
              id="model-name"
              v-model="uploadForm.name"
              placeholder="Enter model name"
              class="w-full"
            />
          </div>
          
          <div class="space-y-2">
            <label for="model-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Model Type *
            </label>
            <Dropdown
              id="model-type"
              v-model="uploadForm.type"
              :options="modelTypes"
              placeholder="Select type"
              class="w-full"
            />
          </div>
        </div>
        
        <div class="space-y-2">
          <label for="model-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            id="model-description"
            v-model="uploadForm.description"
            placeholder="Model description..."
            rows="3"
            class="w-full"
          />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model Files *
          </label>
          <FileUpload
            ref="fileUpload"
            name="files"
            :multiple="true"
            accept=".pt,.pth,.onnx,.safetensors"
            :maxFileSize="5000000000"
            @upload="onUpload"
            @error="onUploadError"
            customUpload
            auto
            :disabled="uploading"
            class="w-full"
          >            <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
              <div v-if="files.length > 0">
                <h5>Pending</h5>
                <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                  <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                    <div>
                      <i class="pi pi-file text-4xl text-primary"></i>
                    </div>
                    <span class="font-semibold">{{ file.name }}</span>
                    <div>{{ formatFileSize(file.size) }}</div>
                    <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded severity="danger" />
                  </div>
                </div>
              </div>
            </template>
            
            <template #empty>
              <div class="flex align-items-center justify-content-center flex-column">
                <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                <p class="mt-4 mb-4">Drag and drop files here to upload.</p>
                <Button label="Choose Files" icon="pi pi-upload" />
              </div>
            </template>
          </FileUpload>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="showUploadDialog = false" />
        <Button 
          label="Upload Model" 
          @click="uploadModel"
          :loading="uploading"
          :disabled="!uploadForm.name || !uploadForm.type"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModelStore } from '@/stores/models'
import { useUIStore } from '@/stores/ui'
import type { Model } from '@/types'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'

// Router and stores
const router = useRouter()
const modelStore = useModelStore()
const uiStore = useUIStore()

// State
const loading = ref(false)
const uploading = ref(false)
const searchQuery = ref('')
const selectedType = ref(null)
const selectedStatus = ref(null)
const showUploadDialog = ref(false)
const showImportDialog = ref(false)

const uploadForm = ref({
  name: '',
  type: '',
  description: ''
})

// Options
const modelTypes = [
  'text-generation',
  'image-generation',
  'text-to-image',
  'text-classification',
  'object-detection',
  'other'
]

const statusOptions = [
  'ready',
  'deployed',
  'loading',
  'error'
]

// Computed
const models = computed(() => modelStore.models)

const filteredModels = computed(() => {
  let filtered = models.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(model =>
      model.name.toLowerCase().includes(query) ||
      model.description?.toLowerCase().includes(query) ||
      model.type.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(model => model.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(model => model.status === selectedStatus.value)
  }

  return filtered
})

const modelStats = computed(() => {
  const total = models.value.length
  const deployed = models.value.filter(m => m.status === 'deployed').length
  const loading = models.value.filter(m => m.status === 'loading').length
  const totalRuns = models.value.reduce((sum, m) => sum + (m.metrics?.total_runs || 0), 0)
  
  return { total, deployed, loading, totalRuns }
})

// Methods
function getModelStatusSeverity(status: string) {
  switch (status) {
    case 'deployed':
      return 'success'
    case 'ready':
      return 'info'
    case 'loading':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'secondary'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function getModelActions(model: Model) {
  return [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => viewModel(model)
    },
    {
      label: 'Download',
      icon: 'pi pi-download',
      command: () => downloadModel(model)
    },
    {
      label: 'Clone',
      icon: 'pi pi-copy',
      command: () => cloneModel(model)
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => confirmDeleteModel(model)
    }
  ]
}

function viewModel(model: Model) {
  router.push(`/models/${model.id}`)
}

async function deployModel(model: Model) {
  try {
    await modelStore.deployModel(model.id, { 
      clusterId: 'default-cluster',
      replicas: 1 
    })
    uiStore.showSuccessToast('Success', `Model ${model.name} deployed successfully`)
  } catch (error) {
    console.error('Failed to deploy model:', error)
    uiStore.showErrorToast('Error', 'Failed to deploy model')
  }
}

async function undeployModel(model: Model) {
  try {
    await modelStore.undeployModel(model.id, 'default-cluster')
    uiStore.showSuccessToast('Success', `Model ${model.name} undeployed successfully`)
  } catch (error) {
    console.error('Failed to undeploy model:', error)
    uiStore.showErrorToast('Error', 'Failed to undeploy model')
  }
}

function testModel(model: Model) {
  router.push(`/models/${model.id}/test`)
}

function downloadModel(model: Model) {
  // Implementation for downloading model
  uiStore.showInfoToast('Info', 'Download started')
}

function cloneModel(model: Model) {
  // Implementation for cloning model
  uiStore.showInfoToast('Info', 'Model cloned')
}

function confirmDeleteModel(model: Model) {
  // Implementation for deleting model
  uiStore.showInfoToast('Info', 'Delete confirmation')
}

async function uploadModel() {
  if (!uploadForm.value.name || !uploadForm.value.type) {
    uiStore.showErrorToast('Error', 'Please fill in all required fields')
    return
  }

  uploading.value = true
  try {
    // Implementation for model upload
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload
    
    uiStore.showSuccessToast('Success', 'Model uploaded successfully')
    showUploadDialog.value = false
    
    // Reset form
    uploadForm.value = {
      name: '',
      type: '',
      description: ''
    }
    
    // Refresh models
    await loadModels()
  } catch (error) {
    console.error('Failed to upload model:', error)
    uiStore.showErrorToast('Error', 'Failed to upload model')
  } finally {
    uploading.value = false
  }
}

function onUpload(event: any) {
  console.log('Files uploaded:', event)
}

function onUploadError(event: any) {
  console.error('Upload error:', event)
  uiStore.showErrorToast('Error', 'Failed to upload files')
}

function onRemoveTemplatingFile(file: any, removeFileCallback: any, index: number) {
  removeFileCallback(index)
}

async function loadModels() {
  loading.value = true
  try {
    await modelStore.fetchModels()
  } catch (error) {
    console.error('Failed to load models:', error)
    uiStore.showErrorToast('Error', 'Failed to load models')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.p-card {
  height: 100%;
}

.p-fileupload .p-fileupload-content {
  position: relative;
}
</style>
