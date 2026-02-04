"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const services = {
    column1: [
        "Valuación profesional gratuita",
        "Fotografía de alta calidad",
        "Tour virtual 360°",
        "Video promocional",
        "Publicación en +50 portales",
        "Promoción en redes sociales"
    ],
    column2: [
        "Asesor dedicado",
        "Organización de visitas",
        "Filtrado de compradores",
        "Negociación profesional",
        "Gestión de documentos",
        "Acompañamiento notarial"
    ]
};

export function ServicesIncluded() {
    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] text-center mb-4">
                        Servicios Incluidos
                    </h2>
                    <p className="text-xl text-[#6B7B6B] text-center mb-12">
                        Todo lo que necesitas para una venta exitosa, sin costos ocultos
                    </p>

                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-[#E5E3DB]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Column 1 */}
                            <div>
                                <ul className="space-y-4">
                                    {services.column1.map((service, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center flex-shrink-0">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-lg text-[#2C3E2C] font-medium">{service}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 2 */}
                            <div>
                                <ul className="space-y-4">
                                    {services.column2.map((service, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center flex-shrink-0">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-lg text-[#2C3E2C] font-medium">{service}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Highlight */}
                        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-l-4 border-[#B8975A] shadow-lg">
                            <p className="text-[#2C3E2C] text-lg font-semibold">
                                💎 Todo incluido en la comisión del 3%. Solo pagas al cerrar la venta.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
