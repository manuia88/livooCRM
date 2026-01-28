"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isHome = pathname === "/";

    // Navbar is transparent on Home until scrolled, White on other pages
    const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b",
                isTransparent
                    ? "bg-transparent border-transparent text-white"
                    : "bg-white/95 backdrop-blur-md border-border text-foreground shadow-sm"
            )}
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    Propiedades<span className={isTransparent ? "text-accent" : "text-primary"}>MX</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/propiedades" className={cn("text-sm font-medium hover:text-accent transition-colors", isTransparent ? "text-white/90" : "text-muted-foreground")}>Rentar</Link>
                    <Link href="/propiedades" className={cn("text-sm font-medium hover:text-accent transition-colors", isTransparent ? "text-white/90" : "text-muted-foreground")}>Comprar</Link>
                    <Link href="#" className={cn("text-sm font-medium hover:text-accent transition-colors", isTransparent ? "text-white/90" : "text-muted-foreground")}>Vender</Link>
                    <Link href="#" className={cn("text-sm font-medium hover:text-accent transition-colors", isTransparent ? "text-white/90" : "text-muted-foreground")}>Nosotros</Link>
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="sm" className={cn(isTransparent ? "text-white hover:bg-white/10" : "")}>
                        <User className="w-4 h-4 mr-2" /> Iniciar Sesión
                    </Button>
                    <Button variant={isTransparent ? "secondary" : "default"} size="sm">
                        Publicar Propiedad
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-border shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link href="/propiedades" className="text-lg font-medium text-foreground py-2 border-b border-border/50">Rentar</Link>
                    <Link href="/propiedades" className="text-lg font-medium text-foreground py-2 border-b border-border/50">Comprar</Link>
                    <Link href="#" className="text-lg font-medium text-foreground py-2 border-b border-border/50">Vender</Link>
                    <div className="pt-4 flex flex-col gap-3">
                        <Button className="w-full" variant="outline">Iniciar Sesión</Button>
                        <Button className="w-full">Publicar Propiedad</Button>
                    </div>
                </div>
            )}
        </header>
    );
}
