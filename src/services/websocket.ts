type WebSocketEventType = 
  | 'cluster_status_changed'
  | 'worker_status_changed'
  | 'task_status_changed'
  | 'model_status_changed'
  | 'metrics_updated'
  | 'system_alert'

interface WebSocketEvent {
  type: WebSocketEventType
  data: any
  timestamp: string
}

interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
}

type EventCallback = (data: any) => void

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private eventListeners: Map<WebSocketEventType, EventCallback[]> = new Map()
  private config: WebSocketConfig
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8000/ws',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10
    }
  }

  connect(token?: string): void {
    try {
      const wsUrl = token ? `${this.config.url}?token=${token}` : this.config.url
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected', {})
      }

      this.ws.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data)
          this.handleEvent(wsEvent)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.emit('disconnected', {})
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', { error })
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.handleReconnect()
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)
      
      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, this.config.reconnectInterval)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('max_reconnect_attempts_reached', {})
    }
  }

  private handleEvent(event: WebSocketEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(callback => {
      try {
        callback(event.data)
      } catch (error) {
        console.error(`Error in WebSocket event handler for ${event.type}:`, error)
      }
    })
  }

  // Subscribe to specific event types
  on(eventType: WebSocketEventType | 'connected' | 'disconnected' | 'error' | 'max_reconnect_attempts_reached', callback: EventCallback): void {
    if (!this.eventListeners.has(eventType as WebSocketEventType)) {
      this.eventListeners.set(eventType as WebSocketEventType, [])
    }
    this.eventListeners.get(eventType as WebSocketEventType)?.push(callback)
  }

  // Unsubscribe from event types
  off(eventType: WebSocketEventType | 'connected' | 'disconnected' | 'error' | 'max_reconnect_attempts_reached', callback?: EventCallback): void {
    if (!callback) {
      this.eventListeners.delete(eventType as WebSocketEventType)
      return
    }

    const listeners = this.eventListeners.get(eventType as WebSocketEventType) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType as WebSocketEventType) || []
    listeners.forEach(callback => callback(data))
  }

  // Send message to server
  send(type: string, data: any): void {
    if (this.ws && this.isConnected) {
      const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() })
      this.ws.send(message)
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Update configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService()
