import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { taskService, type TaskListParams, type CreateTaskParams, type TaskQueueStats } from '@/services/tasks'
import type { Task, TaskType, TaskPriority } from '@/types'
import { TaskStatus } from '@/types'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const queueStats = ref<TaskQueueStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Getters
  const pendingTasks = computed(() => 
    tasks.value.filter((task: Task) => task.status === TaskStatus.PENDING)
  )

  const runningTasks = computed(() => 
    tasks.value.filter((task: Task) => task.status === TaskStatus.RUNNING)
  )

  const completedTasks = computed(() => 
    tasks.value.filter((task: Task) => task.status === TaskStatus.COMPLETED)
  )

  const failedTasks = computed(() => 
    tasks.value.filter((task: Task) => task.status === TaskStatus.FAILED)
  )

  const tasksByType = computed(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.value.forEach((task: Task) => {
      if (!grouped[task.type]) {
        grouped[task.type] = []
      }
      grouped[task.type].push(task)
    })
    return grouped
  })

  const getTaskById = computed(() => {
    return (id: string) => tasks.value.find((task: Task) => task.id === id)
  })

  // Actions
  async function fetchTasks(params: TaskListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.getTasks(params)
      if (response.success) {
        tasks.value = response.data
        pagination.value = response.pagination
      } else {
        error.value = response.message || 'Failed to fetch tasks'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.getTask(id)
      if (response.success) {
        currentTask.value = response.data
        
        // Update task in list if it exists
        const index = tasks.value.findIndex((t: Task) => t.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data
        }
      } else {
        error.value = response.message || 'Failed to fetch task'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function createTask(params: CreateTaskParams) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.createTask(params)
      if (response.success) {
        tasks.value.unshift(response.data) // Add to beginning of list
        return response.data
      } else {
        error.value = response.message || 'Failed to create task'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  async function cancelTask(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.cancelTask(id)
      if (response.success) {
        // Update task status in local state
        const task = tasks.value.find((t: Task) => t.id === id)
        if (task) {
          task.status = TaskStatus.CANCELLED
        }
        
        if (currentTask.value?.id === id) {
          currentTask.value.status = TaskStatus.CANCELLED
        }
        
        return true
      } else {
        error.value = response.message || 'Failed to cancel task'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function retryTask(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.retryTask(id)
      if (response.success) {
        // Update task in list
        const index = tasks.value.findIndex((t: Task) => t.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data
        }
        
        if (currentTask.value?.id === id) {
          currentTask.value = response.data
        }
        
        return response.data
      } else {
        error.value = response.message || 'Failed to retry task'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskResult(id: string) {
    try {
      const response = await taskService.getTaskResult(id)
      if (response.success) {
        return response.data
      } else {
        error.value = response.message || 'Failed to fetch task result'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    }
  }

  async function fetchTaskLogs(id: string) {
    try {
      const response = await taskService.getTaskLogs(id)
      if (response.success) {
        return response.data
      } else {
        error.value = response.message || 'Failed to fetch task logs'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    }
  }

  async function fetchQueueStats() {
    try {
      const response = await taskService.getQueueStats()
      if (response.success) {
        queueStats.value = response.data
      } else {
        console.error('Failed to fetch queue stats:', response.message)
      }
    } catch (err) {
      console.error('Failed to fetch queue stats:', err)
    }
  }

  async function fetchTasksByModel(modelId: string, params: TaskListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.getTasksByModel(modelId, params)
      if (response.success) {
        return response.data
      } else {
        error.value = response.message || 'Failed to fetch tasks by model'
        return []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchTasksByWorker(workerId: string, params: TaskListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.getTasksByWorker(workerId, params)
      if (response.success) {
        return response.data
      } else {
        error.value = response.message || 'Failed to fetch tasks by worker'
        return []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  async function bulkCancelTasks(taskIds: string[]) {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.bulkCancelTasks(taskIds)
      if (response.success) {
        // Update task statuses in local state
        taskIds.forEach(id => {
          const task = tasks.value.find((t: Task) => t.id === id)
          if (task) {
            task.status = TaskStatus.CANCELLED
          }
        })
        
        return true
      } else {
        error.value = response.message || 'Failed to cancel tasks'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function clearCompletedTasks() {
    loading.value = true
    error.value = null
    
    try {
      const response = await taskService.clearCompletedTasks()
      if (response.success) {
        // Remove completed tasks from local state
        tasks.value = tasks.value.filter((task: Task) => task.status !== TaskStatus.COMPLETED)
        return true
      } else {
        error.value = response.message || 'Failed to clear completed tasks'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  function updateTaskStatus(taskId: string, status: TaskStatus, progress?: number) {
    const task = tasks.value.find((t: Task) => t.id === taskId)
    if (task) {
      task.status = status
      if (progress !== undefined) {
        task.progress = progress
      }
    }
    
    if (currentTask.value?.id === taskId) {
      currentTask.value.status = status
      if (progress !== undefined) {
        currentTask.value.progress = progress
      }
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentTask(task: Task | null) {
    currentTask.value = task
  }
  return {
    // State
    tasks: readonly(tasks),
    currentTask: readonly(currentTask),
    queueStats: readonly(queueStats),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    
    // Getters
    pendingTasks,
    runningTasks,
    completedTasks,
    failedTasks,
    tasksByType,
    getTaskById,
    
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    cancelTask,
    retryTask,
    fetchTaskResult,
    fetchTaskLogs,
    fetchQueueStats,
    fetchTasksByModel,
    fetchTasksByWorker,
    bulkCancelTasks,
    clearCompletedTasks,
    updateTaskStatus,
    clearError,
    setCurrentTask
  }
})
