"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Menu, X, ChevronDown, User, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const DROPDOWN_CLOSE_DELAY_MS = 150;

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimeout = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimeout();
        closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), DROPDOWN_CLOSE_DELAY_MS);
    };

    const menuItems = [
        {
            label: "Comprar",
            href: "/propiedades?type=buy",
            dropdown: [
                { label: "Casas", href: "/propiedades?type=buy&category=casa" },
                { label: "Departamentos", href: "/propiedades?type=buy&category=departamento" },
            ]
        },
        {
            label: "Rentar",
            href: "/propiedades?type=rent",
            dropdown: [
                { label: "Casas", href: "/propiedades?type=rent&category=casa" },
                { label: "Departamentos", href: "/propiedades?type=rent&category=departamento" },
            ]
        },
        {
            label: "Soy Propietario",
            href: "/vender-mi-propiedad",
            dropdown: [
                { label: "Vender mi Propiedad", href: "/vender-mi-propiedad" },
                { label: "Rentar mi Propiedad", href: "/rentar-mi-propiedad" },
                { label: "Valuación Gratuita", href: "/valuacion" },
                { label: "Consejos para Vender o Rentar", href: "/consejos" },
            ]
        },
        {
            label: "Para Agencias Inmobiliarias",
            href: "/agencias",
        },
        {
            label: "Nosotros",
            href: "/sobre-nosotros",
            dropdown: [
                { label: "Sobre Nosotros", href: "/sobre-nosotros" },
                { label: "Nuestro Equipo", href: "/equipo" },
                { label: "Contacto", href: "/contacto" },
                { label: "Blog", href: "/blog" },
            ]
        },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40">
            {/* Barra superior de marca */}
            <div className="h-1 bg-gradient-to-r from-[#2C3E2C] via-[#B8975A] to-[#2C3E2C]" />

            <nav className="bg-white/95 backdrop-blur-xl shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo + nombre */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden bg-[#FAF8F3] border border-[#E5E3DB] shadow-sm group-hover:shadow-md group-hover:border-[#B8975A]/40 transition-all duration-300">
                                <Image
                                    src="/images/livoo-logo.png"
                                    alt="Livoo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <div className="hidden sm:block">
                                <span className="block text-lg font-bold text-[#2C3E2C] tracking-tight leading-tight">LIVOO</span>
                                <span className="block text-[10px] font-medium text-[#6B7B6B] uppercase tracking-widest">Bienes Raíces</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-0.5">
                            {menuItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => {
                                        clearCloseTimeout();
                                        if (item.dropdown) setActiveDropdown(item.label);
                                    }}
                                    onMouseLeave={scheduleClose}
                                >
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#2C3E2C] rounded-lg transition-all duration-200 hover:text-[#B8975A] hover:bg-[#FAF8F3] group/link"
                                    >
                                        <span className="relative">
                                            {item.label}
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B8975A] group-hover/link:w-full transition-all duration-200" />
                                        </span>
                                        {item.dropdown && (
                                            <ChevronDown className={`w-4 h-4 text-[#6B7B6B] transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180 text-[#B8975A]" : ""}`} />
                                        )}
                                    </Link>

                                    {/* Dropdown: sin hueco (pt-2) para que el cursor no pierda el área al bajar */}
                                    {item.dropdown && activeDropdown === item.label && (
                                        <div
                                            className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-[#E5E3DB] pt-2 pb-2 animate-in fade-in slide-in-from-top-2"
                                            style={{ marginTop: 0 }}
                                            onMouseEnter={clearCloseTimeout}
                                        >
                                            <div className="absolute top-0 left-3 w-0.5 h-6 bg-gradient-to-b from-[#B8975A] to-transparent rounded-full" />
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className="flex items-center px-4 py-2.5 text-sm text-[#2C3E2C] hover:bg-[#FAF8F3] hover:text-[#B8975A] transition-colors border-l-2 border-transparent hover:border-[#B8975A] ml-0.5"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right: Login + CTA */}
                        <div className="hidden lg:flex items-center gap-2">
                            <Link href="/auth">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-2 border-[#E5E3DB] text-[#2C3E2C] hover:border-[#B8975A] hover:text-[#B8975A] hover:bg-[#FAF8F3] font-semibold transition-all duration-200"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                className="rounded-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold px-5"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Publicar Propiedad
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2.5 rounded-xl hover:bg-[#FAF8F3] border border-transparent hover:border-[#E5E3DB] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-[#2C3E2C]" />
                            ) : (
                                <Menu className="w-6 h-6 text-[#2C3E2C]" />
                            )}
                        </button>
                    </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#E5E3DB] py-4 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <div key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center justify-between px-4 py-3 text-base font-medium text-[#2C3E2C] hover:bg-[#F8F7F4] hover:text-[#B8975A] rounded-xl transition-colors"
                                        onClick={() => !item.dropdown && setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                        {item.dropdown && (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </Link>
                                    {item.dropdown && (
                                        <div className="pl-4 space-y-1">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className="block px-4 py-2 text-sm text-[#556B55] hover:text-[#B8975A] transition-colors"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#E5E3DB] space-y-2 px-4">
                            <Link href="/auth" className="block">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-[#E5E3DB] hover:bg-[#F8F7F4] hover:text-[#B8975A]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Button
                                className="w-full rounded-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white font-semibold"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Publicar Propiedad
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
        </header>
    );
}
