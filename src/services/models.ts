import { apiClient } from './api'
import type { Model, ModelMetrics, ApiResponse } from '@/types'

export interface ModelListParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
}

export interface ModelDeployParams {
  clusterId: string
  workerIds?: string[]
  replicas?: number
  config?: Record<string, any>
}

export const modelService = {  // Get all models
  async getModels(params: ModelListParams = {}): Promise<ApiResponse<Model[]>> {
    const response = await apiClient.get<ApiResponse<Model[]>>('/models', { params })
    return response.data
  },

  // Get model by ID
  async getModel(id: string): Promise<ApiResponse<Model>> {
    const response = await apiClient.get<ApiResponse<Model>>(`/models/${id}`)
    return response.data
  },

  // Add new model
  async addModel(model: Partial<Model>): Promise<ApiResponse<Model>> {
    const response = await apiClient.post<ApiResponse<Model>>('/models', model)
    return response.data
  },

  // Update model
  async updateModel(id: string, updates: Partial<Model>): Promise<ApiResponse<Model>> {
    const response = await apiClient.put<ApiResponse<Model>>(`/models/${id}`, updates)
    return response.data
  },

  // Delete model
  async deleteModel(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/models/${id}`)
    return response.data
  },
  // Deploy model to cluster
  async deployModel(id: string, params: ModelDeployParams): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/models/${id}/deploy`, params)
    return response.data
  },

  // Undeploy model
  async undeployModel(id: string, clusterId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/models/${id}/undeploy`, { clusterId })
    return response.data
  },

  // Get model metrics
  async getModelMetrics(id: string, timeRange: string = '1h'): Promise<ApiResponse<ModelMetrics>> {
    const response = await apiClient.get<ApiResponse<ModelMetrics>>(`/models/${id}/metrics`, {
      params: { timeRange }
    })
    return response.data
  },

  // Test model inference
  async testInference(id: string, input: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(`/models/${id}/test`, { input })
    return response.data
  },

  // Download model
  async downloadModel(id: string): Promise<Blob> {
    const response = await apiClient.get(`/models/${id}/download`, {
      responseType: 'blob'
    })
    return response.data as Blob
  },

  // Upload model file
  async uploadModel(file: File, metadata: Partial<Model>): Promise<ApiResponse<Model>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    const response = await apiClient.post<ApiResponse<Model>>('/models/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
