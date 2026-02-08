import { Sidebar } from "@/components/backoffice/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "./backoffice/actions";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Toaster } from "sonner";

export default async function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/auth");
    }

    return (
        <NotificationsProvider>
            <div className="flex min-h-screen bg-[#F8F7F4]">
                <Sidebar user={user} logoutAction={logout} />
                <main className="flex-grow ml-64 min-h-screen">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </NotificationsProvider>
    )
}
