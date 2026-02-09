'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const STAGES = [
  { key: 'lead', label: 'Lead', color: '#94a3b8' },
  { key: 'prospect', label: 'Prospecto', color: '#3b82f6' },
  { key: 'qualified', label: 'Calificado', color: '#8b5cf6' },
  { key: 'negotiating', label: 'Negociación', color: '#f59e0b' },
  { key: 'closed', label: 'Cierre', color: '#10b981' },
] as const

interface PipelineDataPoint {
  stage: string
  count: number
  color: string
}

export default function SalesPipelineChart() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  const { data, isLoading } = useQuery<PipelineDataPoint[]>({
    queryKey: ['sales-pipeline', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser) return []

      const { data: contacts } = await supabase
        .from('contacts')
        .select('status')
        .eq('agency_id', currentUser.agency_id)
        .is('deleted_at', null)

      if (!contacts) return []

      return STAGES.map((stage) => ({
        stage: stage.label,
        count: contacts.filter((c) => c.status === stage.key).length,
        color: stage.color,
      }))
    },
    enabled: !!currentUser,
    staleTime: 2 * 60 * 1000,
  })

  if (isLoading) {
    return <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg" />
  }

  if (!data || data.every((d) => d.count === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        Sin datos de pipeline disponibles
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6b7280' }}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="stage"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#374151' }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number) => [`${value} contactos`, 'Cantidad']}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
