import { apiClient } from './api'
import type { Cluster, Worker, SystemMetrics } from '@/types'

export const clusterApi = {
  async getClusters(): Promise<Cluster[]> {
    const response = await apiClient.get<Cluster[]>('/clusters')
    return response.data
  },

  async getCluster(id: string): Promise<Cluster> {
    const response = await apiClient.get<Cluster>(`/clusters/${id}`)
    return response.data
  },

  async getWorkers(clusterId?: string): Promise<Worker[]> {
    const url = clusterId ? `/clusters/${clusterId}/workers` : '/workers'
    const response = await apiClient.get<Worker[]>(url)
    return response.data
  },

  async getWorker(id: string): Promise<Worker> {
    const response = await apiClient.get<Worker>(`/workers/${id}`)
    return response.data
  },

  async restartWorker(id: string): Promise<void> {
    await apiClient.post(`/workers/${id}/restart`)
  },

  async stopWorker(id: string): Promise<void> {
    await apiClient.post(`/workers/${id}/stop`)
  },
  async getMetrics(clusterId?: string): Promise<SystemMetrics> {
    const url = clusterId ? `/clusters/${clusterId}/metrics` : '/metrics'
    const response = await apiClient.get<SystemMetrics>(url)
    return response.data
  },

  async createCluster(clusterData: Partial<Cluster>): Promise<Cluster> {
    const response = await apiClient.post<Cluster>('/clusters', clusterData)
    return response.data
  },

  async deleteCluster(id: string): Promise<void> {
    await apiClient.delete(`/clusters/${id}`)
  }
}
