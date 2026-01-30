// /src/components/analytics/FunnelChart.tsx
'use client'

import { useFunnel } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function FunnelChart() {
    const { data: funnelData, isLoading } = useFunnel()

    if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>

    const colors = [
        '#94a3b8', // gray-400
        '#60a5fa', // blue-400
        '#3b82f6', // blue-500
        '#2563eb', // blue-600
        '#1d4ed8', // blue-700
        '#22c55e', // green-500 (won)
        '#ef4444'  // red-500 (lost)
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Embudo de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={funnelData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="stage"
                            width={100}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {funnelData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
