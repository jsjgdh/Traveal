import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle, Clock, Signal } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

// WebSocket simulation class
class WebSocketSimulator {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.readyState = WebSocket.CONNECTING
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    this.onerror = null
    
    this.connectionAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isManualClose = false
    
    // Simulate connection
    this.connect()






  }
  
  connect() {
    this.connectionAttempts++
    
    // Simulate connection delay
    setTimeout(() => {
      if (this.connectionAttempts <= this.maxReconnectAttempts) {
        this.readyState = WebSocket.OPEN
        this.onopen?.({ type: 'open' })
        this.startHeartbeat()
      } else {
        this.readyState = WebSocket.CLOSED
        this.onerror?.({ type: 'error', message: 'Max reconnection attempts reached' })
      }
    }, Math.random() * 2000 + 500)
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.readyState === WebSocket.OPEN) {
        // Simulate random disconnections (5% chance)
        if (Math.random() < 0.05) {
          this.simulateDisconnection()
        } else {
          // Send heartbeat
          this.onmessage?.({
            type: 'message',
            data: JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })
          })
        }
      }
    }, 5000)
  }
  
  simulateDisconnection() {
    this.readyState = WebSocket.CLOSED
    clearInterval(this.heartbeatInterval)
    this.onclose?.({ type: 'close', code: 1006, reason: 'Connection lost' })
    
    if (!this.isManualClose) {
      // Auto-reconnect
      setTimeout(() => {
        if (this.connectionAttempts < this.maxReconnectAttempts) {
          this.readyState = WebSocket.CONNECTING
          this.connect()
        }
      }, this.reconnectDelay * this.connectionAttempts)
    }
  }
  
  send(data) {
    if (this.readyState === WebSocket.OPEN) {
      // Simulate send delay and potential failures
      setTimeout(() => {
        if (Math.random() < 0.95) { // 95% success rate
          this.onmessage?.({
            type: 'message',
            data: JSON.stringify({
              type: 'ack',
              originalData: data,
              timestamp: new Date().toISOString()
            })
          })
        } else {
          this.onerror?.({ type: 'error', message: 'Send failed' })
        }
      }, Math.random() * 200 + 50)
    } else {
      throw new Error('WebSocket is not open')
    }
  }
  
  close() {
    this.isManualClose = true
    this.readyState = WebSocket.CLOSED
    clearInterval(this.heartbeatInterval)
    this.onclose?.({ type: 'close', code: 1000, reason: 'Manual close' })
  }
}

function WebSocketIndicator() {
  const { updateSystemStatus, addNotification } = useNotifications()
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastHeartbeat, setLastHeartbeat] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [latency, setLatency] = useState(null)
  const [dataQueue, setDataQueue] = useState([])
  const [isRetrying, setIsRetrying] = useState(false)
  
  const ws = React.useRef(null)
  const pingStartTime = React.useRef(null)

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const connectWebSocket = () => {
    setConnectionStatus('connecting')
    setIsRetrying(true)
    
    // Use WebSocket simulator for demo
    ws.current = new WebSocketSimulator('wss://api.natpac.gov.in/ws')
    
    ws.current.onopen = () => {
      setConnectionStatus('connected')
      setReconnectAttempts(0)
      setIsRetrying(false)
      
      updateSystemStatus({ wsConnected: true, lastSync: new Date().toISOString() })
      
      addNotification({
        type: NOTIFICATION_TYPES.SYNC_STATUS,
        priority: NOTIFICATION_PRIORITY.LOW,
        title: 'Connected to Server',
        message: 'Real-time sync is now active',
        showBanner: false
      })
      
      // Process queued data
      processQueuedData()
    }
    
    ws.current.onclose = (event) => {
      setConnectionStatus('disconnected')
      updateSystemStatus({ wsConnected: false })
      
      if (event.code !== 1000) { // Not a manual close
        setReconnectAttempts(prev => prev + 1)
        
        addNotification({
          type: NOTIFICATION_TYPES.SYNC_STATUS,
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          title: 'Connection Lost',
          message: 'Attempting to reconnect...',
          showBanner: false
        })
      }
    }
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'heartbeat':
          setLastHeartbeat(new Date())
          if (pingStartTime.current) {
            setLatency(Date.now() - pingStartTime.current)
            pingStartTime.current = null
          }
          break
          
        case 'trip_update':
          handleTripUpdate(data)
          break
          
        case 'achievement_update':
          handleAchievementUpdate(data)
          break
          
        case 'challenge_update':
          handleChallengeUpdate(data)
          break
          
        case 'sync_complete':
          updateSystemStatus({ lastSync: new Date().toISOString() })
          break
          
        default:
          console.log('Unknown message type:', data.type)
      }
    }
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      addNotification({
        type: NOTIFICATION_TYPES.SYNC_STATUS,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        title: 'Connection Error',
        message: 'Failed to connect to server',
        showBanner: false
      })
    }
  }

  const handleTripUpdate = (data) => {
    addNotification({
      type: NOTIFICATION_TYPES.TRIP_VALIDATION,
      priority: NOTIFICATION_PRIORITY.HIGH,
      title: 'Trip Detected',
      message: `New trip from ${data.origin} to ${data.destination}`,
      data: data.trip
    })
  }

  const handleAchievementUpdate = (data) => {
    addNotification({
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      priority: NOTIFICATION_PRIORITY.HIGH,
      title: '🎉 Achievement Unlocked!',
      message: `You earned "${data.achievement.name}"`,
      data: data.achievement
    })
  }

  const handleChallengeUpdate = (data) => {
    addNotification({
      type: NOTIFICATION_TYPES.CHALLENGE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      title: 'Challenge Update',
      message: data.message,
      data: data.challenge
    })
  }

  const processQueuedData = () => {
    if (dataQueue.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
      dataQueue.forEach(data => {
        ws.current.send(JSON.stringify(data))
      })
      setDataQueue([])
    }
  }

  const queueData = (data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    } else {
      setDataQueue(prev => [...prev, data])
    }
  }

  const pingServer = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      pingStartTime.current = Date.now()
      ws.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />
      case 'connecting':
        return <Clock size={16} className="text-yellow-500 animate-spin" />
      case 'disconnected':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <WifiOff size={16} className="text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return reconnectAttempts > 0 ? `Reconnecting (${reconnectAttempts})` : 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </span>
        </div>
        
        {connectionStatus === 'connected' && (
          <button
            onClick={pingServer}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Test
          </button>
        )}
      </div>
      
      {/* Status Details */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
        <div>
          <div className="font-medium">Last Heartbeat</div>
          <div>
            {lastHeartbeat ? lastHeartbeat.toLocaleTimeString() : 'Never'}
          </div>
        </div>
        
        <div>
          <div className="font-medium">Latency</div>
          <div className={latency ? (latency < 100 ? 'text-green-600' : latency < 300 ? 'text-yellow-600' : 'text-red-600') : ''}>
            {latency ? `${latency}ms` : 'Unknown'}
          </div>
        </div>
      </div>
      
      {/* Queued Data Indicator */}
      {dataQueue.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="flex items-center space-x-1">
            <Clock size={12} className="text-yellow-600" />
            <span className="text-yellow-700">
              {dataQueue.length} items queued for sync
            </span>
          </div>
        </div>
      )}
      
      {/* Connection Actions */}
      {connectionStatus === 'disconnected' && !isRetrying && (
        <button
          onClick={connectWebSocket}
          className="mt-2 w-full text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded hover:bg-blue-100 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}

export default WebSocketIndicator