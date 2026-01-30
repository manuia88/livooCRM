"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E3DB] shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Image Only */}
                    <Link href="/" className="flex items-center group">
                        <div className="relative w-16 h-16 flex-shrink-0">
                            {/* Livoo Logo */}
                            <Image
                                src="/images/livoo-logo.png"
                                alt="Livoo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        {menuItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#2C3E2C] hover:text-[#B8975A] transition-colors rounded-lg hover:bg-[#F8F7F4]"
                                >
                                    {item.label}
                                    {item.dropdown && (
                                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''
                                            }`} />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.dropdown && activeDropdown === item.label && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-[#E5E3DB] py-2 animate-in fade-in slide-in-from-top-2">
                                        {item.dropdown.map((subItem) => (
                                            <Link
                                                key={subItem.label}
                                                href={subItem.href}
                                                className="block px-4 py-2.5 text-sm text-[#2C3E2C] hover:bg-[#F8F7F4] hover:text-[#B8975A] transition-colors"
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right side buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link href="/auth">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#2C3E2C] hover:text-[#B8975A] hover:bg-[#F8F7F4]"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
                        >
                            Publicar Propiedad
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-[#F8F7F4] transition-colors"
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
                                        className="flex items-center justify-between px-4 py-3 text-base font-medium text-[#2C3E2C] hover:bg-[#F8F7F4] hover:text-[#B8975A] rounded-lg transition-colors"
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
                                className="w-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Publicar Propiedad
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
