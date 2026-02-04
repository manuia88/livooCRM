"use client";

import { motion } from "framer-motion";

interface Step {
    number: string;
    title: string;
    description: string;
}

interface OwnerProcessProps {
    type: "vender" | "rentar";
}

export function OwnerProcess({ type }: OwnerProcessProps) {
    const steps: Step[] = type === "vender" ? [
        {
            number: "01",
            title: "Solicita tu valuación",
            description: "Compártenos los detalles de tu propiedad y recibe un análisis de precio de mercado gratuito."
        },
        {
            number: "02",
            title: "Preparamos tu anuncio",
            description: "Sesión de fotos profesional, redacción de copy persuasivo y publicación en portales premium."
        },
        {
            number: "03",
            title: "Gestionamos visitas",
            description: "Filtramos a los interesados y coordinamos las visitas solo con compradores potenciales reales."
        },
        {
            number: "04",
            title: "Cierre exitoso",
            description: "Te acompañamos en la negociación y trámites legales hasta la firma de escrituras."
        }
    ] : [
        {
            number: "01",
            title: "Agenda una cita",
            description: "Un asesor experto visitará tu propiedad para evaluar su potencial de renta y sugerir mejoras."
        },
        {
            number: "02",
            title: "Promoción masiva",
            description: "Tu propiedad aparecerá destacada en Livoo y en los principales portales inmobiliarios de México."
        },
        {
            number: "03",
            title: "Selección del inquilino",
            description: "Realizamos una investigación profunda (Know Your Customer) para encontrar al inquilino ideal."
        },
        {
            number: "04",
            title: "Administración total",
            description: "Nos encargamos de la cobranza, mantenimiento y atención al inquilino durante todo el contrato."
        }
    ];

    return (
        <section className="py-24 bg-[#2C3E2C] text-white overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B8975A] rounded-full blur-[120px] opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#556B55] rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    <div className="lg:w-1/3 sticky top-24">
                        <span className="text-[#B8975A] font-semibold tracking-wider uppercase text-sm block mb-4">Paso a paso</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Así de fácil es {type === "vender" ? "vender" : "rentar"} con Livoo
                        </h2>
                        <div className="h-1 w-20 bg-[#B8975A] mb-8" />
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            Simplificamos un proceso complejo para que tú solo disfrutes de los resultados. Transparencia total en cada etapa.
                        </p>
                    </div>

                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <span className="text-6xl font-bold text-white/5 absolute -top-10 -left-6 select-none font-serif">
                                    {step.number}
                                </span>
                                <div className="relative z-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-full border border-[#B8975A] flex items-center justify-center text-[#B8975A] font-bold mb-6 bg-[#2C3E2C]">
                                        {step.number}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
