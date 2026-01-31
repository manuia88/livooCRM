import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PriorityAction {
    id: string
    title: string
    description: string
    priority_level: number
    action_url: string
    action_type: string
}

interface PriorityActionsProps {
    actions: PriorityAction[]
}

const PRIORITY_COLORS: Record<number, string> = {
    5: "text-red-500 bg-red-50 border-red-100", // Critical
    4: "text-orange-500 bg-orange-50 border-orange-100", // High
    3: "text-yellow-600 bg-yellow-50 border-yellow-100", // Medium
    2: "text-blue-500 bg-blue-50 border-blue-100", // Low
    1: "text-gray-500 bg-gray-50 border-gray-100"  // Info
}

export function PriorityActions({ actions }: PriorityActionsProps) {
    if (!actions || actions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Acciones Prioritarias</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">¡Todo al día!</p>
                    <p className="text-sm text-gray-500 mt-1">No tienes acciones pendientes urgentes.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Acciones Prioritarias
                    </CardTitle>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                        {actions.length} pendientes
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {actions.map((action) => {
                    const colorClass = PRIORITY_COLORS[action.priority_level] || PRIORITY_COLORS[1]

                    return (
                        <div
                            key={action.id}
                            className={`p-4 rounded-lg border border-l-4 flex items-start justify-between gap-4 transition-all hover:shadow-sm ${action.priority_level >= 4 ? 'border-l-red-500' : 'border-l-blue-500'} bg-white`}
                        >
                            <div>
                                <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                            </div>
                            <Link href={action.action_url}>
                                <Button variant="ghost" size="sm" className="shrink-0">
                                    Resolver <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
