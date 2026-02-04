"use client";

import { motion } from "framer-motion";
import { Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CertificationBadge() {
    return (
        <section className="py-20 bg-[#FAF8F3]/60 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] text-center mb-16">
                    Tu agencia más eficiente, reconocida y conectada
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Seal of Technology */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            {/* Sello placeholder */}
                            <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-sm border-4 border-[#B8975A] shadow-xl flex items-center justify-center p-8">
                                <div className="text-center">
                                    <Award className="w-24 h-24 text-[#B8975A] mx-auto mb-4" />
                                    <span className="text-xl font-bold text-[#2C3E2C]">Sello de Tecnología</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Award className="w-8 h-8 text-[#B8975A]" />
                                <h3 className="text-2xl font-bold text-[#2C3E2C]">Sello de Tecnología</h3>
                            </div>
                            <p className="text-[#6B7B6B] leading-relaxed mb-6">
                                Más que un reconocimiento, el sello de tecnología Livoo comprueba que tu agencia es más moderna y equipada, y opera con tecnología de punta ganando más agilidad, transparencia y menos burocracia en los procesos de compra, venta y renta de inmuebles.
                            </p>
                            <Button
                                variant="outline"
                                className="border-2 border-[#B8975A] text-[#B8975A] hover:bg-[#FAF8F3] rounded-full shadow-sm"
                            >
                                Conquistar mi sello
                            </Button>
                        </div>
                    </motion.div>

                    {/* Integrated Solutions */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            {/* Placeholder for integrated solutions image */}
                            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#F8F7F4] to-[#F1EFE8] border border-[#E5E3DB] shadow-xl flex items-center justify-center">
                                <Zap className="w-32 h-32 text-[#B8975A]" />
                            </div>
                        </div>

                        <div className="mt-8 p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-8 h-8 text-[#B8975A]" />
                                <h3 className="text-2xl font-bold text-[#2C3E2C]">Soluciones Integradas</h3>
                            </div>
                            <p className="text-[#6B7B6B] leading-relaxed mb-6">
                                Livoo es especialista en soluciones tecnológicas, financieras y comerciales para acelerar el viaje de compra, venta y renta de tu agencia inmobiliaria.
                            </p>
                            <Button
                                variant="outline"
                                className="border-2 border-[#B8975A] text-[#B8975A] hover:bg-[#FAF8F3] rounded-full shadow-sm"
                            >
                                Acelerar mi agencia
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
