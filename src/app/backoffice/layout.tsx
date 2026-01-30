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
                    <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E3DB] px-8 py-5 sticky top-0 z-40">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium text-[#2C3E2C]">
                                Panel de Administración
                            </h2>
                            <div className="flex items-center gap-4">
                                <Link href="/backoffice/configuracion">
                                    <Button variant="ghost" size="icon" className="text-[#777] hover:bg-[#F8F7F4]">
                                        <Settings className="w-5 h-5" />
                                    </Button>
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
