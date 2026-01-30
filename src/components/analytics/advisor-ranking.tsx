'use client';

import { AdvisorStats } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';

interface AdvisorRankingProps {
    advisors: AdvisorStats[];
    currentAdvisorId?: string; // To highlight the current user
}

export function AdvisorRanking({ advisors, currentAdvisorId = '1' }: AdvisorRankingProps) {
    // Sort by ranking just in case
    const sortedAdvisors = [...advisors].sort((a, b) => a.rank - b.rank);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Ranking de Asesores</CardTitle>
                <CardDescription>Top performers del mes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sortedAdvisors.map((advisor) => (
                        <div
                            key={advisor.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${advisor.id === currentAdvisorId ? 'bg-blue-50 border-blue-200' : 'border-slate-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="font-bold text-lg text-slate-400 w-6 text-center">
                                    #{advisor.rank}
                                </div>
                                <Avatar>
                                    <AvatarImage src={advisor.avatarUrl} />
                                    <AvatarFallback>{advisor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                                        {advisor.name}
                                        {advisor.id === currentAdvisorId && (
                                            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 h-5">
                                                Tú
                                            </Badge>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {advisor.dealsClosed} cierres
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-bold">
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(advisor.totalSales)}
                                </p>
                                {/* Simulated Goal: 1.2x current sales for demo */}
                                <div className="w-24 ml-auto mt-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                                        <span>Meta</span>
                                        <span>80%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end text-xs text-emerald-600 font-medium mt-1">
                                    <Medal className="w-3 h-3 mr-1" />
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(advisor.commission)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
