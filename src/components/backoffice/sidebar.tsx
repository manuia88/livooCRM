"use client";

import { usePathname } from "next/navigation";
import {
    LogOut,
    LayoutGrid,
    Home,
    Users,
    Target,
    Magnet,
    Building,
    Activity,
    Megaphone,
    BarChart3,
    Bookmark,
    Headphones,
    ListChecks
} from "@/components/icons";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/notifications/NotificationBell";

interface SidebarProps {
    user: any;
    logoutAction: any;
}

export function Sidebar({ user, logoutAction }: SidebarProps) {
    const pathname = usePathname();

    const menuGroups = [
        {
            label: "Gestión Principal",
            items: [
                { label: "Dashboard", href: "/backoffice", icon: LayoutGrid },
                { label: "Propiedades", href: "/backoffice/propiedades", icon: Home },
                { label: "Contactos", href: "/backoffice/contactos", icon: Users },
                { label: "Tareas", href: "/backoffice/tareas", icon: ListChecks },
            ]
        },
        {
            label: "Operaciones",
            items: [
                { label: "Búsquedas", href: "/backoffice/busquedas", icon: Target },
                { label: "Captaciones", href: "/backoffice/captaciones", icon: Magnet },
                { label: "Inbox", href: "/backoffice/inbox", icon: Headphones },
                { label: "Analytics", href: "/backoffice/analytics", icon: BarChart3 },
                { label: "Inventario", href: "/backoffice/inventario", icon: Building },
                { label: "Actividad", href: "/backoffice/operaciones", icon: Activity },
            ]
        },
        {
            label: "Análisis y Config",
            items: [
                { label: "Reportes", href: "/backoffice/reportes", icon: BarChart3 },
                { label: "Marketing", href: "/backoffice/marketing", icon: Megaphone },
                { label: "Usuarios", href: "/backoffice/usuarios", icon: Users },
            ]
        }
    ];

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E5E3DB] z-50 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-[#F8F7F4]">
                <Link href="/backoffice" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/images/livoo-logo.png"
                            alt="Livoo Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#2C3E2C] uppercase">livoo</span>
                </Link>
                <NotificationBell />
            </div>

            {/* Navigation Container */}
            <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6 last:mb-0">
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.href !== "/backoffice" && pathname?.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                            ? "bg-[#2C3E2C]/5 text-[#2C3E2C] font-semibold"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-[#2C3E2C]"
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#2C3E2C]" : "text-gray-400 group-hover:text-[#2C3E2C]"}`} />
                                        <span className="text-[13px] tracking-tight">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        {groupIdx < menuGroups.length - 1 && (
                            <div className="h-px bg-[#F1F0ED] mx-2 mt-4" />
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto border-t border-[#F8F7F4] bg-white">
                <div className="px-3 py-4">
                    <Link
                        href="/backoffice/ayuda"
                        className="flex items-center gap-3 px-3 py-2.5 text-[#555] hover:text-[#2C3E2C] transition-colors"
                    >
                        <Headphones className="w-5 h-5 text-[#777]" />
                        <span className="text-sm">¿Necesitas ayuda?</span>
                    </Link>
                </div>

                <div className="px-5 py-4 flex items-center gap-3 border-t border-[#F8F7F4]">
                    <div className="relative">
                        <Avatar className="w-10 h-10 border border-[#E5E3DB]">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-[#B8975A] text-white">
                                {user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ade80] border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2C3E2C] truncate">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full"></div>
                            <p className="text-[11px] font-medium text-[#4ade80]">Disponible</p>
                        </div>
                    </div>
                    <form action={logoutAction}>
                        <button type="submit" className="text-[#777] hover:text-[#B85C5C] transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E3DB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #B8975A;
                }
            `}</style>
        </aside>
    );
}
