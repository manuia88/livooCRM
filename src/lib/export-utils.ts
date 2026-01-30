import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { KPI, MonthlyData, AdvisorStats } from '@/types/analytics';

export const exportToPDF = (
    kpis: KPI[],
    monthlyData: MonthlyData[],
    advisors: AdvisorStats[],
    period: string
) => {
    const doc = new jsPDF();

    // Add Logo Placeholder
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('NEXUS OS', 15, 13);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text('Reporte Ejecutivo', 15, 35);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()} | Período: ${period}`, 15, 42);

    // KPIs Section
    doc.setFontSize(14);
    doc.text('Resumen de KPIs', 15, 55);

    const kpiRows = kpis.map(k => [k.label, k.value.toString(), `${k.change}%`]);
    autoTable(doc, {
        startY: 60,
        head: [['Métrica', 'Valor', 'Cambio']],
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });

    // Monthly Data Section
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Desempeño Mensual', 15, currentY);

    const monthlyRows = monthlyData.map(m => [m.month, m.leads, m.closings, `$${m.value.toLocaleString()}`]);
    autoTable(doc, {
        startY: currentY + 5,
        head: [['Mes', 'Leads', 'Cierres', 'Valor Ventas']],
        body: monthlyRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
    });

    // Top Advisors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const advisorsY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Top Asesores', 15, advisorsY);

    const advisorRows = advisors.map(a => [a.rank, a.name, a.dealsClosed, `$${a.totalSales.toLocaleString()}`]);
    autoTable(doc, {
        startY: advisorsY + 5,
        head: [['Ranking', 'Asesor', 'Cierres', 'Ventas Totales']],
        body: advisorRows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });

    // Footer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    }

    doc.save(`Filtro_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (
    kpis: KPI[],
    monthlyData: MonthlyData[],
    advisors: AdvisorStats[]
) => {
    const wb = XLSX.utils.book_new();

    // KPIs Sheet
    const kpiData = kpis.map(k => ({
        Metrica: k.label,
        Valor: k.value,
        Cambio: `${k.change}%`,
        Tendencia: k.trend
    }));
    const wsKPI = XLSX.utils.json_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKPI, 'KPIs');

    // Monthly Data Sheet
    const wsMonth = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonth, 'Mensual');

    // Advisors Sheet
    const wsAdvisors = XLSX.utils.json_to_sheet(advisors);
    XLSX.utils.book_append_sheet(wb, wsAdvisors, 'Asesores');

    XLSX.writeFile(wb, `Reporte_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
};
