import { apiClient } from './api'
import type { Task, TaskType, TaskStatus, TaskPriority, ApiResponse, PaginatedResponse } from '@/types'

export interface TaskListParams {
  page?: number
  limit?: number
  status?: TaskStatus
  type?: TaskType
  priority?: TaskPriority
  modelId?: string
  workerId?: string
  search?: string
}

export interface CreateTaskParams {
  type: TaskType
  modelId: string
  parameters: Record<string, any>
  priority?: TaskPriority
  workerId?: string
}

export interface TaskQueueStats {
  total: number
  pending: number
  queued: number
  running: number
  completed: number
  failed: number
  cancelled: number
}

export const taskService = {
  // Get all tasks with pagination
  async getTasks(params: TaskListParams = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params })
    return response.data
  },

  // Get task by ID
  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data
  },

  // Create new task
  async createTask(params: CreateTaskParams): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', params)
    return response.data
  },
  // Cancel task
  async cancelTask(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/tasks/${id}/cancel`)
    return response.data
  },

  // Retry failed task
  async retryTask(id: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${id}/retry`)
    return response.data
  },

  // Get task result
  async getTaskResult(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/tasks/${id}/result`)
    return response.data
  },

  // Get task logs
  async getTaskLogs(id: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<ApiResponse<string[]>>(`/tasks/${id}/logs`)
    return response.data
  },

  // Get queue statistics
  async getQueueStats(): Promise<ApiResponse<TaskQueueStats>> {
    const response = await apiClient.get<ApiResponse<TaskQueueStats>>('/tasks/queue/stats')
    return response.data
  },
  // Get tasks by model
  async getTasksByModel(modelId: string, params: TaskListParams = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>(`/models/${modelId}/tasks`, { params })
    return response.data
  },

  // Get tasks by worker
  async getTasksByWorker(workerId: string, params: TaskListParams = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>(`/workers/${workerId}/tasks`, { params })
    return response.data
  },

  // Bulk cancel tasks
  async bulkCancelTasks(taskIds: string[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/tasks/bulk/cancel', { taskIds })
    return response.data
  },

  // Clear completed tasks
  async clearCompletedTasks(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>('/tasks/completed')
    return response.data
  }
}
