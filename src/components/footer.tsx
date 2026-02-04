import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="py-14 bg-[#1F2D1F] text-gray-400 rounded-t-[2rem] overflow-hidden shadow-2xl border-t border-[#556B55]/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2C3E2C] to-[#556B55] flex items-center justify-center border-2 border-[#B8975A] overflow-hidden relative shadow-xl">
                                {/* Placeholder for optional Livoo logo image inside footer */}
                                <Image src="/images/livoo-logo.png" alt="L" fill className="object-cover" />
                                <span className="text-[#B8975A] font-serif text-lg font-bold">L</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase">LIVOO</h3>
                                <p className="text-[10px] text-[#B8975A] uppercase tracking-wider">Bienes Raíces</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed">
                            La plataforma inmobiliaria más elegante de México.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-[#B8975A] to-transparent" />
                            Enlaces
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/propiedades" className="hover:text-[#B8975A] transition-colors">Propiedades</Link></li>
                            <li><Link href="/agencias" className="hover:text-[#B8975A] transition-colors">Agencias</Link></li>
                            <li><Link href="/vender" className="hover:text-[#B8975A] transition-colors">Vender</Link></li>
                            <li><Link href="/rentar" className="hover:text-[#B8975A] transition-colors">Rentar</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-[#B8975A] to-transparent" />
                            Recursos
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/blog" className="hover:text-[#B8975A] transition-colors">Blog</Link></li>
                            <li><Link href="/guias" className="hover:text-[#B8975A] transition-colors">Guías</Link></li>
                            <li><Link href="/financiamiento" className="hover:text-[#B8975A] transition-colors">Financiamiento</Link></li>
                            <li><Link href="/ayuda" className="hover:text-[#B8975A] transition-colors">Ayuda</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-[#B8975A] to-transparent" />
                            Contacto
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-[#B8975A] transition-colors cursor-pointer">contacto@livoo.mx</li>
                            <li className="hover:text-[#B8975A] transition-colors cursor-pointer">+52 55 1234 5678</li>
                            <li>CDMX, México</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#556B55]/30 pt-8 text-center text-sm">
                    <p>© 2024 Livoo Bienes Raíces. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
