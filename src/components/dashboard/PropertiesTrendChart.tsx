'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface TrendDataPoint {
  date: string
  nuevas: number
  activas: number
  vendidas: number
}

export default function PropertiesTrendChart() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  const { data, isLoading } = useQuery<TrendDataPoint[]>({
    queryKey: ['properties-trend', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser) return []

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: properties } = await supabase
        .from('properties')
        .select('created_at, status, updated_at')
        .eq('agency_id', currentUser.agency_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (!properties || properties.length === 0) return []

      const groupedByDay: Record<string, TrendDataPoint> = {}

      // Generate all days in range for continuous chart
      for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateKey = d.toLocaleDateString('es-MX', {
          month: 'short',
          day: 'numeric',
        })
        groupedByDay[dateKey] = { date: dateKey, nuevas: 0, activas: 0, vendidas: 0 }
      }

      properties.forEach((prop) => {
        const dateKey = new Date(prop.created_at).toLocaleDateString('es-MX', {
          month: 'short',
          day: 'numeric',
        })

        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = { date: dateKey, nuevas: 0, activas: 0, vendidas: 0 }
        }

        groupedByDay[dateKey].nuevas++

        const status = prop.status as string
        if (status === 'disponible' || status === 'active') {
          groupedByDay[dateKey].activas++
        }
        if (status === 'vendida' || status === 'sold') {
          groupedByDay[dateKey].vendidas++
        }
      })

      return Object.values(groupedByDay)
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        Sin datos de propiedades en los últimos 30 días
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6b7280' }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6b7280' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="nuevas"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          name="Nuevas"
        />
        <Line
          type="monotone"
          dataKey="activas"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          name="Activas"
        />
        <Line
          type="monotone"
          dataKey="vendidas"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          name="Vendidas"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
