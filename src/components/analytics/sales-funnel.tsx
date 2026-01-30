'use client';

import { SalesFunnelData } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface SalesFunnelProps {
    data: SalesFunnelData;
}

export function SalesFunnel({ data }: SalesFunnelProps) {
    // Find the max value (usually the first stage) to calculate relative widths
    const maxCount = Math.max(...data.stages.map(s => s.count));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Embudo de Ventas</CardTitle>
                <CardDescription>Conversión de leads por etapa (Últimos 90 días)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.stages.map((stage, index) => {
                    // Calculate conversion from previous stage
                    const prevStage = index > 0 ? data.stages[index - 1] : null;
                    const conversionRate = prevStage
                        ? ((stage.count / prevStage.count) * 100).toFixed(1)
                        : 100;

                    // Set color based on conversion threshold (red if < 10% drop, just an example logic)
                    // The prompt says: Indicadores verde (>10%) / rojo (<10%) logic seems to imply retention rate
                    const isGoodConversion = Number(conversionRate) > 10;

                    return (
                        <div key={stage.stage} className="relative">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium text-slate-700">{stage.stage}</span>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-900">
                                        {stage.count} leads
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(stage.value)}
                                    </span>
                                </div>
                            </div>

                            {/* Funnel Bar Background */}
                            <div className="h-8 bg-slate-100 rounded-r-lg overflow-hidden relative">
                                {/* Visual Bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="h-full bg-blue-500 rounded-r-lg opacity-80"
                                    style={{
                                        backgroundColor: index === data.stages.length - 1 ? '#22c55e' : '#3b82f6' // Last stage green
                                    }}
                                />
                            </div>

                            {/* Connector / Conversion Indicator */}
                            {index < data.stages.length - 1 && (
                                <div className="flex justify-center my-1">
                                    <div className={`
                    text-xs px-2 py-0.5 rounded-full font-bold flex items-center
                    ${isGoodConversion ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                  `}>
                                        ↓ {Number(conversionRate)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
