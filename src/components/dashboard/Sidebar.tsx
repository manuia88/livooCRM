'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Home, Users, BarChart, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const links = [
        { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
        { href: '/dashboard/properties', label: 'Propiedades', icon: Home },
        { href: '/dashboard/inbox', label: 'Mensajes', icon: MessageSquare },
        { href: '/dashboard/contacts', label: 'Contactos', icon: Users },
        { href: '/dashboard/analytics', label: 'Reportes', icon: BarChart },
    ];

    return (
        <div className="flex flex-col h-full bg-white border-r w-64">
            <div className="h-16 flex items-center px-6 border-b">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Nexus OS</span>
            </div>

            <div className="flex-1 py-4 flex flex-col gap-1 px-3">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));

                    return (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
