'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  description?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'teal'
  variant?: 'default' | 'compact'
  className?: string
  onClick?: () => void
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' }
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'blue',
  variant = 'default',
  className,
  onClick
}: StatsCardProps) {
  const colors = colorMap[color]
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-200 transition-all duration-200',
        isCompact ? 'p-4' : 'p-5 sm:p-6',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        !onClick && 'hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('rounded-xl', colors.bg, isCompact ? 'p-2' : 'p-3')}>
          <Icon className={cn(colors.text, isCompact ? 'w-5 h-5' : 'w-6 h-6')} />
        </div>

        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend.isPositive
              ? 'text-green-700 bg-green-50'
              : 'text-red-700 bg-red-50'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className={cn('text-gray-500', isCompact ? 'text-xs mb-0.5' : 'text-sm mb-1')}>
          {title}
        </p>
        <p className={cn(
          'font-bold text-gray-900',
          isCompact ? 'text-2xl' : 'text-3xl'
        )}>
          {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-1.5">{description}</p>
        )}
        {trend?.label && (
          <p className="text-xs text-gray-400 mt-1">{trend.label}</p>
        )}
      </div>
    </div>
  )
}

export function StatsCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const isCompact = variant === 'compact'

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-200', isCompact ? 'p-4' : 'p-5 sm:p-6')}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('bg-gray-200 rounded-xl animate-pulse', isCompact ? 'w-9 h-9' : 'w-12 h-12')} />
        <div className="w-14 h-5 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className={cn('h-3.5 bg-gray-200 rounded animate-pulse mb-2', isCompact ? 'w-20' : 'w-24')} />
      <div className={cn('bg-gray-200 rounded animate-pulse', isCompact ? 'h-7 w-28' : 'h-8 w-32')} />
    </div>
  )
}
