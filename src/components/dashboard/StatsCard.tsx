'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  yellow: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
  },
} as const

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description,
}: StatsCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {trend && trend.value !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend.isPositive
                ? 'text-green-700 bg-green-50'
                : 'text-red-700 bg-red-50'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-xl" />
      </div>
      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2" />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded mt-2" />
    </div>
  )
}
