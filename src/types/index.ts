// Base types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Auth types
export interface User {
  id: string
  username: string
  email: string
  name?: string
  role: UserRole
  is_active?: boolean
  created_at?: string
  last_login?: string
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

// Cluster types
export interface Cluster {
  id: string
  name: string
  status: ClusterStatus
  worker_count: number
  active_workers: number
  total_gpu_memory: number
  available_gpu_memory: number
  cpu_usage: number
  memory_usage: number
  created_at: string
  updated_at: string
}

export enum ClusterStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DEGRADED = 'degraded',
  MAINTENANCE = 'maintenance'
}

export interface Worker {
  id: string
  cluster_id: string
  name: string
  status: WorkerStatus
  gpu_info: GPUInfo
  system_info: SystemInfo
  current_tasks: number
  max_tasks: number
  last_heartbeat: string
  created_at: string
}

export enum WorkerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface GPUInfo {
  name: string
  memory_total: number
  memory_used: number
  memory_free: number
  utilization: number
  temperature: number
}

export interface SystemInfo {
  cpu_count: number
  cpu_usage: number
  memory_total: number
  memory_used: number
  disk_usage: number
  uptime: number
}

// Model types
export interface Model {
  id: string
  name: string
  type: ModelType
  status: ModelStatus
  source: ModelSource
  size: number
  download_progress?: number
  path: string
  metadata: ModelMetadata
  description?: string
  metrics?: ModelMetrics
  created_at: string
  updated_at: string
}

export interface ModelMetrics {
  accuracy: number
  total_runs: number
  avg_response_time: number
  error_rate: number
}

export enum ModelType {
  TEXT_GENERATION = 'text-generation',
  TEXT_TO_IMAGE = 'text-to-image',
  IMAGE_TO_TEXT = 'image-to-text',
  AUDIO_TO_TEXT = 'audio-to-text',
  TEXT_TO_AUDIO = 'text-to-audio',
  EMBEDDING = 'embedding',
  CLASSIFICATION = 'classification',
  OTHER = 'other'
}

export enum ModelStatus {
  DOWNLOADING = 'downloading',
  AVAILABLE = 'available',
  READY = 'ready',
  DEPLOYED = 'deployed',
  LOADING = 'loading',
  ERROR = 'error',
  DELETED = 'deleted',
  PENDING = 'pending'
}

export enum ModelSource {
  HUGGINGFACE = 'huggingface',
  GITHUB = 'github',
  CUSTOM = 'custom',
  LOCAL = 'local'
}

export interface ModelMetadata {
  description?: string
  license?: string
  tags: string[]
  parameters: Record<string, any>
  requirements: string[]
}

export interface ModelMetrics {
  modelId: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  throughput: number
  errorRate: number
  memoryUsage: number
  gpuUtilization: number
  timeRange: string
  dataPoints: Array<{
    timestamp: string
    requests: number
    latency: number
    throughput: number
    errors: number
  }>
}

// Task types
export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  model_id: string
  worker_id?: string
  cluster_id?: string
  parameters: Record<string, any>
  input_data?: any
  output_data?: any
  result?: any
  error_message?: string
  progress: number
  estimated_duration?: number
  actual_duration?: number
  execution_time?: number
  created_at: string
  updated_at?: string
  started_at?: string
  completed_at?: string
}

export enum TaskType {
  TEXT_GENERATION = 'text-generation',
  IMAGE_GENERATION = 'image_generation',
  TEXT_TO_IMAGE = 'text-to-image',
  IMAGE_TO_TEXT = 'image-to-text',
  TEXT_TO_SPEECH = 'text_to_speech',
  SPEECH_TO_TEXT = 'speech_to_text',
  EMBEDDING = 'embedding',
  CLASSIFICATION = 'classification'
}

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

// Metrics types
export interface SystemMetrics {
  timestamp: string
  cluster_metrics: ClusterMetrics
  worker_metrics: WorkerMetrics[]
  task_metrics: TaskMetrics
}

export interface ClusterMetrics {
  total_workers: number
  active_workers: number
  total_gpu_memory: number
  used_gpu_memory: number
  cpu_usage: number
  memory_usage: number
  network_io: NetworkIO
  disk_io: DiskIO
}

export interface WorkerMetrics {
  worker_id: string
  gpu_utilization: number
  gpu_memory_usage: number
  cpu_usage: number
  memory_usage: number
  temperature: number
  power_usage: number
}

export interface TaskMetrics {
  total_tasks: number
  running_tasks: number
  completed_tasks: number
  failed_tasks: number
  average_duration: number
  throughput: number
}

export interface NetworkIO {
  bytes_sent: number
  bytes_received: number
  packets_sent: number
  packets_received: number
}

export interface DiskIO {
  read_bytes: number
  write_bytes: number
  read_count: number
  write_count: number
}

// WebSocket types
export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: any
  timestamp: string
}

export enum WebSocketMessageType {
  CLUSTER_UPDATE = 'cluster_update',
  WORKER_UPDATE = 'worker_update',
  TASK_UPDATE = 'task_update',
  MODEL_UPDATE = 'model_update',
  METRICS_UPDATE = 'metrics_update',
  SYSTEM_ALERT = 'system_alert'
}

// UI types
export interface NavigationItem {
  name: string
  href: string
  icon: string
  current: boolean
  badge?: string | number
}

export interface Breadcrumb {
  name: string
  href?: string
  current: boolean
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  actions?: ToastAction[]
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ToastAction {
  label: string
  action: () => void
}

// Chart types
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
}

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins?: Record<string, any>
  scales?: Record<string, any>
}
