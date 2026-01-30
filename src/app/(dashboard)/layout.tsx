import QueryProvider from '@/components/providers/query-provider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <div className="min-h-screen bg-slate-50/50">
                {/* Sidebar would go here */}
                <div className="p-8">
                    {children}
                </div>
            </div>
        </QueryProvider>
    );
}
