'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface UserLevelCardProps {
    level: string;
    objective: {
        target: number;
        current: number;
        percentage: number;
        period: string;
    };
}

export function UserLevelCard({ level, objective }: UserLevelCardProps) {
    return (
        <Card className="bg-white border border-gray-100 shadow-none overflow-hidden relative group rounded-2xl">
            <CardContent className="p-10 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                    {/* Level Info */}
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#F8F7F4] transition-all group-hover:scale-105">
                            <Award className="w-8 h-8 text-[#B8975A]" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nivel Actual</span>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {level}
                            </h2>
                        </div>
                    </div>

                    {/* Progress Info */}
                    <div className="flex-1 max-w-xl space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Meta {objective.period}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-gray-900">
                                        ${objective.current.toLocaleString()}
                                    </span>
                                    <span className="text-gray-300 font-medium">/</span>
                                    <span className="text-sm font-semibold text-gray-400">
                                        ${objective.target.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-[#B8975A]">{objective.percentage}%</span>
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${objective.percentage}%` }}
                                className="h-full bg-gradient-to-r from-[#2C3E2C] to-[#B8975A] rounded-full"
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#B8975A] transition-colors group-hover:translate-x-1">
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Detalles</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

