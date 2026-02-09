'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange' | 'teal'
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  description?: string
  variant?: 'default' | 'compact'
  className?: string
  onClick?: () => void
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
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    gradient: 'from-teal-500 to-teal-600',
  },
} as const

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description,
  variant = 'default',
  className,
  onClick,
}: StatsCardProps) {
  const colors = COLOR_MAP[color]
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group',
        isCompact ? 'p-4' : 'p-5',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={cn('font-medium text-gray-600', isCompact ? 'text-xs' : 'text-sm')}>{title}</p>
        <div className={cn('rounded-xl', colors.bg, isCompact ? 'p-2' : 'p-2.5')}>
          <Icon className={cn(colors.icon, isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={cn(
            'font-bold text-gray-900 group-hover:text-gray-700 transition-colors',
            isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
          )}>
            {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {trend?.label && (
            <p className="text-xs text-gray-400 mt-1">{trend.label}</p>
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

export function StatsCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const isCompact = variant === 'compact'

  return (
    <div className={cn(
      'bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200',
      isCompact ? 'p-4' : 'p-5'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('bg-gray-200 animate-pulse rounded', isCompact ? 'h-3 w-20' : 'h-4 w-24')} />
        <div className={cn('bg-gray-200 animate-pulse rounded-xl', isCompact ? 'h-8 w-8' : 'h-10 w-10')} />
      </div>
      <div className={cn('bg-gray-200 animate-pulse rounded mt-2', isCompact ? 'h-6 w-14' : 'h-8 w-16')} />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded mt-2" />
    </div>
  )
}
