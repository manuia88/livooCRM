"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function RequirementsList() {
    const requirements = [
        "Propiedad en buen estado de conservación",
        "Servicios al corriente (agua, luz, predial)",
        "Documentación legal en regla (escrituras)",
        "Fotos actualizadas del inmueble",
        "Precio de renta competitivo acorde al mercado",
        "Ubicación en zona de cobertura Livoo"
    ];

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm border-t border-[#E5E3DB]">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-8">
                        Requisitos para rentar con nosotros
                    </h2>

                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#E5E3DB] shadow-xl">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            {requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#B8975A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[#2C3E2C] font-medium">{req}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 text-sm text-[#6B7B6B]">
                            * Un asesor verificará estos puntos durante la visita inicial.
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
