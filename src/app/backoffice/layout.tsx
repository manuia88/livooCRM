import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { LogOut, Home, Building2, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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

    const menuItems = [
        { label: "Dashboard", href: "/backoffice", icon: Home },
        { label: "Propiedades", href: "/backoffice/propiedades", icon: Building2 },
        { label: "Usuarios", href: "/backoffice/usuarios", icon: Users },
        { label: "Reportes", href: "/backoffice/reportes", icon: FileText },
        { label: "Configuración", href: "/backoffice/configuracion", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E5E3DB] shadow-sm z-50">
                {/* Logo */}
                <div className="p-6 border-b border-[#E5E3DB]">
                    <Link href="/backoffice" className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/images/livoo-logo.png"
                                alt="Livoo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#2C3E2C]">LIVOO</h1>
                            <p className="text-xs text-[#556B55]">Backoffice</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-[#2C3E2C] hover:bg-[#F8F7F4] hover:text-[#B8975A] rounded-lg transition-all group"
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E5E3DB]">
                    <div className="mb-3 p-3 bg-[#F8F7F4] rounded-lg">
                        <p className="text-xs text-[#556B55] mb-1">Conectado como</p>
                        <p className="text-sm font-medium text-[#2C3E2C] truncate">
                            {user.email}
                        </p>
                    </div>
                    <form action={signOut}>
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full justify-start border-[#E5E3DB] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-[#E5E3DB] px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#2C3E2C]">
                            Panel de Administración
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white rounded-lg text-sm font-semibold">
                                {user.user_metadata?.full_name || "Usuario"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
