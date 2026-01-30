'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/export-utils';
import { KPI, MonthlyData, AdvisorStats } from '@/types/analytics';

interface ExportButtonsProps {
    kpis: KPI[];
    monthlyData: MonthlyData[];
    advisors: AdvisorStats[];
    period: string;
}

export function ExportButtons({ kpis, monthlyData, advisors, period }: ExportButtonsProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => exportToPDF(kpis, monthlyData, advisors, period)}
            >
                <Download className="w-4 h-4 mr-2" />
                PDF
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => exportToExcel(kpis, monthlyData, advisors)}
            >
                <Download className="w-4 h-4 mr-2" />
                Excel
            </Button>
        </div>
    );
}
