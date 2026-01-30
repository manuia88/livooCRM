'use client';

import { MonthlyData } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
    data: MonthlyData[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444']; // Sky, Green, Yellow, Orange, Red

export function SalesTrendChart({ data }: ChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tendencia de Leads</CardTitle>
                <CardDescription>Comportamiento mensual de nuevos prospectos</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="leads"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function ClosingsChart({ data }: ChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cierres Mensuales</CardTitle>
                <CardDescription>Propiedades vendidas/rentadas por mes</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Bar dataKey="closings" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// Simulating source data since it wasn't in the original type but requested in prompt
const sourceData = [
    { name: 'Portal Inmobiliario', value: 45 },
    { name: 'Redes Sociales', value: 30 },
    { name: 'Referidos', value: 15 },
    { name: 'Orgánico', value: 10 },
];

export function LeadSourceChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Fuente de Leads</CardTitle>
                <CardDescription>Origen de los prospectos captados</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {sourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
                    {sourceData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span>{entry.name} ({entry.value}%)</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
