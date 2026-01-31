'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Clock,
    CheckCircle2,
    GraduationCap,
    Home,
    Users,
    ChevronRight,
    Briefcase
} from 'lucide-react';

interface PriorityAction {
    id: string;
    action_type: string;
    priority_level: number;
    title: string;
    description: string;
    action_url: string;
}

export function PriorityWidget({ actions }: { actions?: PriorityAction[] }) {
    const router = useRouter();

    if (!actions || actions.length === 0) {
        return (
            <Card className="bg-white border border-gray-100 shadow-none rounded-2xl overflow-hidden">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Todo al día</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                            Has completado todas tus tareas críticas. ¡Excelente trabajo!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const topActions = actions.slice(0, 4);

    const getActionConfig = (type: string) => {
        switch (type) {
            case 'suspended_advisor':
                return { icon: Users, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Gestión', btn: 'Resolver' };
            case 'expired_offer':
                return { icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Operación', btn: 'Actualizar' };
            case 'overdue_task':
                return { icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Urgente', btn: 'Completar' };
            case 'pending_course':
                return { icon: GraduationCap, color: 'text-[#B8975A]', bg: 'bg-[#F8F7F4]', label: 'Academy', btn: 'Continuar' };
            case 'low_quality_property':
                return { icon: Home, color: 'text-[#2C3E2C]', bg: 'bg-gray-50', label: 'Calidad', btn: 'Mejorar' };
            default:
                return { icon: AlertTriangle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Aviso', btn: 'Ver' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Prioridades del Día</h2>
                    <p className="text-sm text-gray-500 mt-1">Enfoque estratégico para hoy</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#B8975A] font-semibold hover:bg-gray-50 hover:text-[#A68649]"
                >
                    Ver todas <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topActions.map((action, index) => {
                    const config = getActionConfig(action.action_type);
                    const Icon = config.icon;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={action.id}
                        >
                            <Card className="border border-gray-100 shadow-none hover:border-gray-200 transition-all duration-200 bg-white group rounded-2xl h-full flex flex-col">
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-2.5 rounded-xl ${config.bg} ${config.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-2 mb-6">
                                        <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-[#B8975A] transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                            {action.description}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-gray-100 hover:bg-[#2C3E2C] hover:text-white text-gray-700 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider"
                                        onClick={() => router.push(action.action_url.replace('/dashboard', '/backoffice'))}
                                    >
                                        {config.btn}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

