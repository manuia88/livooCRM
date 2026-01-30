
export type Period = 'current_month' | 'last_month' | 'last_90_days' | 'year_to_date';

export interface KPI {
    id: string;
    label: string;
    value: number | string;
    change: number; // percentage
    trend: 'up' | 'down' | 'neutral';
    format?: 'currency' | 'number' | 'percentage';
}

export interface MonthlyData {
    month: string;
    leads: number;
    closings: number;
    value: number; // for bar chart
}

export interface FunnelStage {
    stage: string;
    count: number;
    value: number; // monetary value
    conversionRate?: number; // percentage from previous stage
}

export interface SalesFunnelData {
    totalLeads: number;
    stages: FunnelStage[];
}

export interface AdvisorStats {
    id: string;
    name: string;
    rank: number;
    dealsClosed: number;
    totalSales: number;
    commission: number;
    avatarUrl?: string;
}

export interface PropertyStats {
    id: string;
    title: string;
    views: number;
    contacts: number;
    daysOnMarket: number;
    listedPrice: number;
    averageMarketPrice: number;
}

export interface AnalyticsState {
    period: Period;
    isLoading: boolean;
    error: string | null;
}
