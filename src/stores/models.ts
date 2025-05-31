import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { modelService, type ModelListParams, type ModelDeployParams } from '@/services/models'
import type { Model, ModelMetrics } from '@/types'

export const useModelStore = defineStore('models', () => {
  // State
  const models = ref<Model[]>([])
  const currentModel = ref<Model | null>(null)
  const modelMetrics = ref<Record<string, ModelMetrics>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const availableModels = computed(() => 
    models.value.filter(model => model.status === 'available')
  )

  const modelsByType = computed(() => {
    const grouped: Record<string, Model[]> = {}
    models.value.forEach(model => {
      if (!grouped[model.type]) {
        grouped[model.type] = []
      }
      grouped[model.type].push(model)
    })
    return grouped
  })

  const getModelById = computed(() => {
    return (id: string) => models.value.find(model => model.id === id)
  })

  // Actions
  async function fetchModels(params: ModelListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.getModels(params)
      if (response.success) {
        models.value = response.data
      } else {
        error.value = response.message || 'Failed to fetch models'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function fetchModel(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.getModel(id)
      if (response.success) {
        currentModel.value = response.data
        
        // Update model in list if it exists
        const index = models.value.findIndex(m => m.id === id)
        if (index !== -1) {
          models.value[index] = response.data
        }
      } else {
        error.value = response.message || 'Failed to fetch model'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function addModel(model: Partial<Model>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.addModel(model)
      if (response.success) {
        models.value.push(response.data)
        return response.data
      } else {
        error.value = response.message || 'Failed to add model'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateModel(id: string, updates: Partial<Model>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.updateModel(id, updates)
      if (response.success) {
        const index = models.value.findIndex(m => m.id === id)
        if (index !== -1) {
          models.value[index] = response.data
        }
        
        if (currentModel.value?.id === id) {
          currentModel.value = response.data
        }
        
        return response.data
      } else {
        error.value = response.message || 'Failed to update model'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteModel(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.deleteModel(id)
      if (response.success) {
        models.value = models.value.filter(m => m.id !== id)
        
        if (currentModel.value?.id === id) {
          currentModel.value = null
        }
        
        return true
      } else {
        error.value = response.message || 'Failed to delete model'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deployModel(id: string, params: ModelDeployParams) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.deployModel(id, params)
      if (response.success) {
        // Refresh model data to get updated deployment status
        await fetchModel(id)
        return true
      } else {
        error.value = response.message || 'Failed to deploy model'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function undeployModel(id: string, clusterId: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.undeployModel(id, clusterId)
      if (response.success) {
        // Refresh model data to get updated deployment status
        await fetchModel(id)
        return true
      } else {
        error.value = response.message || 'Failed to undeploy model'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchModelMetrics(id: string, timeRange: string = '1h') {
    try {
      const response = await modelService.getModelMetrics(id, timeRange)
      if (response.success) {
        modelMetrics.value[id] = response.data
      }
    } catch (err) {
      console.error('Failed to fetch model metrics:', err)
    }
  }

  async function testModelInference(id: string, input: any) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.testInference(id, input)
      if (response.success) {
        return response.data
      } else {
        error.value = response.message || 'Failed to test model inference'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  async function uploadModel(file: File, metadata: Partial<Model>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await modelService.uploadModel(file, metadata)
      if (response.success) {
        models.value.push(response.data)
        return response.data
      } else {
        error.value = response.message || 'Failed to upload model'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentModel(model: Model | null) {
    currentModel.value = model
  }

  return {
    // State
    models,
    currentModel,
    modelMetrics,
    loading,
    error,
    
    // Getters
    availableModels,
    modelsByType,
    getModelById,
    
    // Actions
    fetchModels,
    fetchModel,
    addModel,
    updateModel,
    deleteModel,
    deployModel,
    undeployModel,
    fetchModelMetrics,
    testModelInference,
    uploadModel,
    clearError,
    setCurrentModel
  }
})
