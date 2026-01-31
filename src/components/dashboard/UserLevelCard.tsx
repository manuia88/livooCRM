import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, ChevronRight } from "lucide-react"

interface UserLevelCardProps {
    level: string
    objective: {
        target: number
        current: number
        percentage: number
        period: string
    }
}

export function UserLevelCard({ level, objective }: UserLevelCardProps) {
    // Determine color/icon based on level name if needed, or use props
    // For now simple logic

    return (
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white border-none shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-32 h-32" />
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Tu Nivel</p>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#B8975A] to-[#F2D086]">
                            {level}
                        </h2>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[#B8975A]/20 flex items-center justify-center border border-[#B8975A]/50">
                        <Star className="w-5 h-5 text-[#B8975A]" fill="currentColor" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Progreso de objetivo ({objective.period})</span>
                            <span className="text-white font-bold">{objective.percentage}%</span>
                        </div>
                        <Progress value={objective.percentage} className="h-2 bg-gray-700" indicatorClassName="bg-[#B8975A]" />
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Ventas Actuales</p>
                            <p className="text-xl font-bold text-white">${objective.current.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Meta</p>
                            <p className="text-xl font-bold text-gray-300">${objective.target.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
