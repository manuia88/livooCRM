'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';

export function AnalyticsFilters() {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-1 bg-slate-100/50 rounded-lg w-fit">
            <Button variant="ghost" size="sm" className="bg-white shadow-sm text-slate-700 h-8">
                <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-500" />
                Últimos 30 días
            </Button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 hover:bg-white text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Todo
                </Button>
                <Button variant="ghost" size="sm" className="h-8 hover:bg-white text-slate-600 hover:text-slate-900">
                    Venta
                </Button>
                <Button variant="ghost" size="sm" className="h-8 hover:bg-white text-slate-600 hover:text-slate-900">
                    Renta
                </Button>
            </div>
        </div>
    );
}
