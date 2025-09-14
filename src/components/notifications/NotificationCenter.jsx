import React, { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Settings, Filter, Search, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function NotificationCenter({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications()

  const [filter, setFilter] = useState('all') // all, unread, type-specific
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())

  // Filter notifications based on current filter and search
  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower) ||
        notification.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    
    // Type filter
    if (filter === 'unread') return !notification.read
    if (filter !== 'all') return notification.type === filter
    
    return true
  })

  // Auto-close when clicking outside (handled by parent)
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedNotifications(new Set())
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle notification actions based on type
    switch (notification.type) {
      case NOTIFICATION_TYPES.TRIP_VALIDATION:
        // Navigate to trip validation page
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl
        }
        break
      case NOTIFICATION_TYPES.ACHIEVEMENT:
        // Show achievement modal or navigate to rewards
        if (notification.onAction) {
          notification.onAction()
        }
        break
      default:
        break
    }
  }

  const toggleSelectNotification = (id) => {
    const newSelected = new Set(selectedNotifications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedNotifications(newSelected)
  }

  const handleBulkAction = (action) => {
    selectedNotifications.forEach(id => {
      switch (action) {
        case 'markRead':
          markAsRead(id)
          break
        case 'delete':
          removeNotification(id)
          break
        default:
          break
      }
    })
    setSelectedNotifications(new Set())
  }

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      size: 20,
      className: `${getPriorityColor(priority)} flex-shrink-0`
    }

    switch (type) {
      case NOTIFICATION_TYPES.TRIP_VALIDATION:
        return <Clock {...iconProps} />
      case NOTIFICATION_TYPES.ACHIEVEMENT:
        return <Check {...iconProps} />
      case NOTIFICATION_TYPES.CHALLENGE:
        return <AlertCircle {...iconProps} />
      case NOTIFICATION_TYPES.SYSTEM_STATUS:
      case NOTIFICATION_TYPES.BATTERY_WARNING:
      case NOTIFICATION_TYPES.LOCATION_UPDATE:
        return <AlertCircle {...iconProps} />
      default:
        return <Bell {...iconProps} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case NOTIFICATION_PRIORITY.CRITICAL:
        return 'text-red-600'
      case NOTIFICATION_PRIORITY.HIGH:
        return 'text-orange-600'
      case NOTIFICATION_PRIORITY.MEDIUM:
        return 'text-blue-600'
      case NOTIFICATION_PRIORITY.LOW:
        return 'text-gray-600'
      default:
        return 'text-blue-600'
    }
  }

  const getTypeDisplayName = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.TRIP_VALIDATION:
        return 'Trip Validation'
      case NOTIFICATION_TYPES.ACHIEVEMENT:
        return 'Achievement'
      case NOTIFICATION_TYPES.CHALLENGE:
        return 'Challenge'
      case NOTIFICATION_TYPES.SYSTEM_STATUS:
        return 'System Status'
      case NOTIFICATION_TYPES.BATTERY_WARNING:
        return 'Battery Warning'
      case NOTIFICATION_TYPES.LOCATION_UPDATE:
        return 'Location Update'
      case NOTIFICATION_TYPES.SYNC_STATUS:
        return 'Sync Status'
      default:
        return 'Notification'
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-md h-full sm:h-auto sm:max-h-[80vh] sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell size={24} className="text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: NOTIFICATION_TYPES.TRIP_VALIDATION, label: 'Trips' },
              { key: NOTIFICATION_TYPES.ACHIEVEMENT, label: 'Rewards' },
              { key: NOTIFICATION_TYPES.SYSTEM_STATUS, label: 'System' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === key
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="flex items-center space-x-2 animate-slide-down">
              <span className="text-sm text-gray-600">
                {selectedNotifications.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('markRead')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                <span>Clear all</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search or filters'
                  : 'You\'re all caught up! New notifications will appear here.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer animate-fade-in ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelectNotification(notification.id)
                      }}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />

                    {/* Notification Icon */}
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {getTypeDisplayName(notification.type)}
                            </span>
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2 mt-2" />
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter