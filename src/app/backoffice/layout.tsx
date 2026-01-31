import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "./actions";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import QueryProvider from "@/components/providers/query-provider";
import { Sidebar } from "@/components/backoffice/sidebar";

export default async function BackofficeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth");
    }

    return (
        <QueryProvider>
            <div className="min-h-screen bg-[#F8F7F4] font-sans selection:bg-[#B8975A]/20">
                <Sidebar user={user} logoutAction={logout} />

                {/* Main Content Area */}
                <main className="ml-64 min-h-screen transition-all duration-300">
                    {/* Top Bar - Minimalist */}
                    <header className="px-8 py-8 sticky top-0 z-40 bg-[#F8F7F4]/80 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Panel de Administración
                                </h2>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Operaciones en tiempo real</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link href="/backoffice/configuracion">
                                    <button className="h-11 w-11 rounded-full border border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-[#2C3E2C]">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Page Content View */}
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </QueryProvider>
    );
}
