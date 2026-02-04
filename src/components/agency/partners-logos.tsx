"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
    { name: "Anage", logo: "/images/partners/anage.webp" },
    { name: "Auxiliadora", logo: "/images/partners/auxiliadora.webp" },
    { name: "Casa Nova", logo: "/images/partners/casa-nova.webp" },
    { name: "Duda Inmuebles", logo: "/images/partners/duda.webp" },
    { name: "Foxter", logo: "/images/partners/foxter.webp" },
    { name: "Muck", logo: "/images/partners/muck.webp" },
    { name: "Roque", logo: "/images/partners/roque.webp" },
];

export function PartnersLogos() {
    return (
        <section className="py-16 bg-[#FAF8F3]/80 backdrop-blur-sm border-b border-[#E5E3DB]">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center text-2xl md:text-3xl font-bold text-[#2C3E2C] mb-4"
                >
                    Más de <span className="text-[#B8975A]">1,500 agencias</span> ya aceleran con Livoo
                </motion.h2>

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 mt-12">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={partner.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative w-24 h-16 opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0"
                        >
                            {/* Placeholder - Reemplazar con logos reales */}
                            <div className="w-full h-full bg-white/80 backdrop-blur-sm border border-[#E5E3DB] rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow duration-300">
                                <span className="text-xs font-bold text-[#6B7B6B]">{partner.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
