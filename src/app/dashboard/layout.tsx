import { Sidebar } from '@/components/dashboard/Sidebar';
import QueryProvider from '@/components/providers/query-provider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <div className="flex h-screen bg-[#FAF8F3] overflow-hidden font-sans">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 z-30 border-r border-[#E5E7EB] bg-white">
                    <Sidebar />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {/* Header/Top Bar for mobile could be added here if needed */}

                    <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                        {children}
                    </div>
                </main>
            </div>
        </QueryProvider>
    );
}
