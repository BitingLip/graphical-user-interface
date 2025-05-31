import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Cluster, Worker, SystemMetrics } from '@/types'
import { clusterApi } from '@/services/cluster'

export const useClusterStore = defineStore('cluster', () => {
  const clusters = ref<Cluster[]>([])
  const workers = ref<Worker[]>([])
  const metrics = ref<SystemMetrics | null>(null)
  const selectedCluster = ref<Cluster | null>(null)
  const loading = ref(false)

  const activeClusters = computed(() => 
    clusters.value.filter(cluster => cluster.status === 'online')
  )

  const activeWorkers = computed(() =>
    workers.value.filter(worker => worker.status === 'online')
  )

  const totalGPUMemory = computed(() =>
    workers.value.reduce((total, worker) => total + worker.gpu_info.memory_total, 0)
  )

  const usedGPUMemory = computed(() =>
    workers.value.reduce((total, worker) => total + worker.gpu_info.memory_used, 0)
  )

  async function fetchClusters() {
    loading.value = true
    try {
      clusters.value = await clusterApi.getClusters()
    } catch (error) {
      console.error('Failed to fetch clusters:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkers(clusterId?: string) {
    loading.value = true
    try {
      workers.value = await clusterApi.getWorkers(clusterId)
    } catch (error) {
      console.error('Failed to fetch workers:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchMetrics(clusterId?: string) {
    try {
      metrics.value = await clusterApi.getMetrics(clusterId)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  async function selectCluster(cluster: Cluster) {
    selectedCluster.value = cluster
    await fetchWorkers(cluster.id)
    await fetchMetrics(cluster.id)
  }
  async function restartWorker(workerId: string) {
    try {
      await clusterApi.restartWorker(workerId)
      // Refresh workers after restart
      await fetchWorkers(selectedCluster.value?.id)
    } catch (error) {
      console.error('Failed to restart worker:', error)
      throw error
    }
  }

  async function createCluster(clusterData: Partial<Cluster>) {
    try {
      const newCluster = await clusterApi.createCluster(clusterData)
      clusters.value.push(newCluster)
      return newCluster
    } catch (error) {
      console.error('Failed to create cluster:', error)
      throw error
    }
  }

  async function deleteCluster(clusterId: string) {
    try {
      await clusterApi.deleteCluster(clusterId)
      clusters.value = clusters.value.filter(c => c.id !== clusterId)
    } catch (error) {
      console.error('Failed to delete cluster:', error)
      throw error
    }
  }

  function updateWorkerStatus(workerId: string, status: string) {
    const worker = workers.value.find(w => w.id === workerId)
    if (worker) {
      worker.status = status as any
    }
  }

  function updateClusterMetrics(newMetrics: SystemMetrics) {
    metrics.value = newMetrics
  }
  return {
    clusters: readonly(clusters),
    workers: readonly(workers),
    metrics: readonly(metrics),
    selectedCluster: readonly(selectedCluster),
    loading: readonly(loading),
    activeClusters,
    activeWorkers,
    totalGPUMemory,
    usedGPUMemory,
    fetchClusters,
    fetchWorkers,
    fetchMetrics,
    selectCluster,
    restartWorker,
    createCluster,
    deleteCluster,
    updateWorkerStatus,
    updateClusterMetrics
  }
})
