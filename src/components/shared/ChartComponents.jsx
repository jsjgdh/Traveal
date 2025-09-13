import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

// Simple Progress Bar Component
export function ProgressBar({ 
  percentage, 
  color = 'bg-primary-500', 
  height = 'h-2', 
  animated = true,
  delay = 0 
}) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height}`}>
      <div 
        className={`${height} rounded-full ${color} ${animated ? 'animate-scale-bounce' : ''}`}
        style={{ 
          width: `${percentage}%`,
          animationDelay: `${delay}ms`
        }}
      ></div>
    </div>
  )
}

// Simple Bar Chart Component
export function SimpleBarChart({ data, maxValue, color = 'bg-primary-500', height = 100 }) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  
  return (
    <div className="flex justify-between items-end px-2" style={{ height: `${height}px` }}>
      {data.map((item, index) => (
        <div key={item.label} className="flex flex-col items-center space-y-2">
          <div className="text-xs text-gray-500 mb-1">{item.value}</div>
          <div 
            className={`w-6 ${color} rounded-t-sm animate-slide-up`}
            style={{ 
              height: `${(item.value / max) * (height - 40)}px`,
              animationDelay: `${index * 100}ms`
            }}
          ></div>
          <div className="text-xs text-gray-600 font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// Donut Chart Component (CSS-based)
export function DonutChart({ data, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let accumulatedPercentage = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {data.map((segment, index) => {
          const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`
          const strokeDashoffset = -((accumulatedPercentage / 100) * circumference)
          accumulatedPercentage += segment.percentage
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="animate-scale-bounce"
              style={{ animationDelay: `${index * 200}ms` }}
            />
          )
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          {data.reduce((sum, d) => sum + d.value, 0)}
        </span>
        <span className="text-xs text-gray-500">Total</span>
      </div>
    </div>
  )
}

// Mini Stat Card Component
export function MiniStatCard({ icon: Icon, label, value, change, color = 'text-primary-600' }) {
  return (
    <div className="card text-center hover:shadow-lg transition-all duration-200">
      <Icon size={24} className={`${color} mx-auto mb-2`} />
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      {change && (
        <p className={`text-xs flex items-center justify-center ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp size={12} className="mr-1" />
          {change}
        </p>
      )}
    </div>
  )
}

// Loading Skeleton Components
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="space-y-3">
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}

export function ChartSkeleton({ height = 120 }) {
  return (
    <div className="space-y-3">
      <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
      <div 
        className="flex justify-between items-end px-2"
        style={{ height: `${height}px` }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div 
              className="w-6 bg-gray-200 rounded-t-sm animate-pulse"
              style={{ height: `${Math.random() * (height - 30) + 20}px` }}
            ></div>
            <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty State Components
export function EmptyStateCard({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  className = '' 
}) {
  return (
    <div className={`card text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mx-auto mb-4">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionText}
        </button>
      )}
    </div>
  )
}

// Animated Counter Component
export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  suffix = '', 
  prefix = '',
  className = '' 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, ''))
    const increment = numericValue / (duration / 16)
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

// Responsive Grid Component
export function ResponsiveGrid({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 4 }) {
  const gridCols = `grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`
  const gridGap = `gap-${gap}`
  
  return (
    <div className={`grid ${gridCols} ${gridGap}`}>
      {children}
    </div>
  )
}

export default {
  ProgressBar,
  SimpleBarChart,
  DonutChart,
  MiniStatCard,
  CardSkeleton,
  ListItemSkeleton,
  ChartSkeleton,
  EmptyStateCard,
  AnimatedCounter,
  ResponsiveGrid
}