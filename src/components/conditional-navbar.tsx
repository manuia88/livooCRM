'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function ConditionalNavbar() {
    const pathname = usePathname();

    // Don't show navbar on backoffice or dashboard routes
    if (pathname?.startsWith('/backoffice') || pathname?.startsWith('/dashboard')) {
        return null;
    }

    return <Navbar />;
}
