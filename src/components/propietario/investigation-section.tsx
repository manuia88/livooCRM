"use client";

import { motion } from "framer-motion";
import { Search, ShieldAlert, FileText, BadgeCheck } from "lucide-react";

export function InvestigationSection() {
    const steps = [
        {
            icon: Search,
            title: "Historial Crediticio",
            description: "Consultamos Buró de Crédito para verificar el comportamiento de pago y nivel de endeudamiento."
        },
        {
            icon: ShieldAlert,
            title: "Antecedentes Legales",
            description: "Búsqueda en boletines judiciales (civil, mercantil, penal y laboral) en todo México."
        },
        {
            icon: FileText,
            title: "Validación de Ingresos",
            description: "Comprobamos la autenticidad de recibos de nómina o estados de cuenta bancarios (ratio 3:1)."
        },
        {
            icon: BadgeCheck,
            title: "Identidad y Referencias",
            description: "Validación de INE/Pasaporte ante listas oficiales y llamadas a referencias personales."
        }
    ];

    return (
        <section className="py-24 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-3xl mx-auto p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
                    <span className="text-[#B8975A] font-semibold tracking-wider uppercase text-sm block mb-2">Seguridad Primero</span>
                    <h2 className="text-4xl font-bold text-[#2C3E2C] mb-6">Investigación de Inquilinos en 24 horas</h2>
                    <p className="text-[#6B7B6B] text-lg">
                        No te arriesgues. Utilizamos la tecnología de investigación más avanzada de México para filtrar a los malos inquilinos antes de firmar. Conoce a quién le entregas las llaves de tu patrimonio.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-[#E5E3DB] shadow-lg hover:border-[#B8975A] hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#F8F7F4] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                                <step.icon className="w-7 h-7 text-[#2C3E2C] group-hover:text-[#B8975A] transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2C3E2C] mb-3">{step.title}</h3>
                            <p className="text-[#6B7B6B] text-sm leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
