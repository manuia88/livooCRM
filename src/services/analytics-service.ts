import { KPI, MonthlyData, SalesFunnelData, AdvisorStats, PropertyStats } from '@/types/analytics';

// Mock Data Generators

export const mockKPIs: KPI[] = [
    { id: 'leads', label: 'Leads del Mes', value: 145, change: 12, trend: 'up', format: 'number' },
    { id: 'conversion', label: 'Tasa de Conversión', value: 3.2, change: -0.5, trend: 'down', format: 'percentage' },
    { id: 'closings', label: 'Cierres', value: 8, change: 2, trend: 'up', format: 'number' },
    { id: 'commissions', label: 'Comisiones Totales', value: 450000, change: 15, trend: 'up', format: 'currency' },
];

export const mockMonthlyData: MonthlyData[] = [
    { month: 'Ene', leads: 65, closings: 2, value: 5200000 },
    { month: 'Feb', leads: 59, closings: 3, value: 4800000 },
    { month: 'Mar', leads: 80, closings: 4, value: 6100000 },
    { month: 'Abr', leads: 81, closings: 3, value: 5500000 },
    { month: 'May', leads: 96, closings: 5, value: 7200000 },
    { month: 'Jun', leads: 110, closings: 6, value: 8900000 },
    { month: 'Jul', leads: 130, closings: 8, value: 10500000 },
];

export const mockFunnelData: SalesFunnelData = {
    totalLeads: 120, // Example base
    stages: [
        { stage: 'Consultas', count: 120, value: 0, conversionRate: 100 },
        { stage: 'Buscando', count: 90, value: 250000000, conversionRate: 75 },
        { stage: 'Visitando', count: 9, value: 45000000, conversionRate: 10 },
        { stage: 'Ofertando', count: 4, value: 18000000, conversionRate: 44 },
        { stage: 'Cerrado', count: 2, value: 9200000, conversionRate: 50 },
    ]
};

export const mockAdvisors: AdvisorStats[] = [
    { id: '1', name: 'Ana García', rank: 1, dealsClosed: 12, totalSales: 45000000, commission: 900000, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Carlos Ruiz', rank: 2, dealsClosed: 9, totalSales: 32000000, commission: 640000, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Sofia Lopez', rank: 3, dealsClosed: 7, totalSales: 28000000, commission: 560000, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Miguel Angel', rank: 4, dealsClosed: 5, totalSales: 15000000, commission: 300000, avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

export const mockPropertyStats: PropertyStats[] = [
    { id: '1', title: 'Penthouse en Polanco', views: 1250, contacts: 45, daysOnMarket: 12, listedPrice: 15000000, averageMarketPrice: 14800000 },
    { id: '2', title: 'Casa en Pedregal', views: 980, contacts: 32, daysOnMarket: 45, listedPrice: 22000000, averageMarketPrice: 22500000 },
    { id: '3', title: 'Loft en Roma Norte', views: 2100, contacts: 85, daysOnMarket: 5, listedPrice: 4500000, averageMarketPrice: 4200000 },
    { id: '4', title: 'Depa en Condesa', views: 1500, contacts: 50, daysOnMarket: 28, listedPrice: 6500000, averageMarketPrice: 6800000 },
];

// Service Functions
const DELAY = 800;

export const AnalyticsService = {
    getKPIs: async (): Promise<KPI[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockKPIs), DELAY));
    },

    getMonthlyTrends: async (): Promise<MonthlyData[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockMonthlyData), DELAY));
    },

    getSalesFunnel: async (): Promise<SalesFunnelData> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockFunnelData), DELAY));
    },

    getAdvisorRanking: async (): Promise<AdvisorStats[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockAdvisors), DELAY));
    },

    getPropertyAnalytics: async (): Promise<PropertyStats[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockPropertyStats), DELAY));
    }
};
