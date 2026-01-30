// /src/components/analytics/LeaderboardTable.tsx
'use client'

import { useLeaderboard } from '@/hooks/useAnalytics'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

export function LeaderboardTable() {
    const { data: leaderboard, isLoading } = useLeaderboard()

    if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-5 w-5 text-yellow-500" />
            case 1: return <Medal className="h-5 w-5 text-gray-400" />
            case 2: return <Award className="h-5 w-5 text-orange-500" />
            default: return <span className="font-bold text-gray-500">#{index + 1}</span>
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Ranking de Agentes (Mes Actual)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Agente</TableHead>
                            <TableHead className="text-right">Ventas</TableHead>
                            <TableHead className="text-right">Cierres</TableHead>
                            <TableHead className="text-right">Tareas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard?.map((agent, index) => (
                            <TableRow key={agent.agent_id}>
                                <TableCell className="font-medium">
                                    {getRankIcon(index)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={agent.avatar_url} />
                                            <AvatarFallback>{agent.agent_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{agent.agent_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ${agent.sales_volume.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {agent.deals_closed}
                                </TableCell>
                                <TableCell className="text-right">
                                    {agent.tasks_completed}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
