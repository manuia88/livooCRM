"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Camera, Megaphone, Users, FileCheck } from "lucide-react";

interface ProcessStepsProps {
    type: "venta" | "renta";
}

const ventaSteps = [
    {
        icon: ClipboardCheck,
        title: "Valuación",
        description: "Ingresa los datos de tu propiedad y recibe una valuación instantánea basada en datos del mercado"
    },
    {
        icon: Camera,
        title: "Visita",
        description: "Agendamos visita con asesor especializado y tomamos fotografías profesionales en HD"
    },
    {
        icon: Megaphone,
        title: "Publicación",
        description: "Publicamos en +50 portales inmobiliarios y creamos campañas de marketing en redes sociales"
    },
    {
        icon: Users,
        title: "Visitas",
        description: "Organizamos y acompañamos todas las visitas con compradores calificados"
    },
    {
        icon: FileCheck,
        title: "Cierre",
        description: "Negociamos el mejor precio y te acompañamos en todo el proceso notarial hasta la firma"
    }
];

const rentaSteps = [
    {
        icon: ClipboardCheck,
        title: "Registro",
        description: "Sube tu propiedad con fotos y datos básicos. El proceso toma menos de 5 minutos"
    },
    {
        icon: Megaphone,
        title: "Valuación",
        description: "Sugerimos la renta óptima basada en ubicación, características y mercado actual"
    },
    {
        icon: Megaphone,
        title: "Publicación",
        description: "Promocionamos tu propiedad en todos los canales para alcanzar miles de inquilinos"
    },
    {
        icon: Users,
        title: "Selección",
        description: "Verificamos inquilinos: historial crediticio, referencias laborales y comprobantes de ingresos"
    },
    {
        icon: FileCheck,
        title: "Contrato",
        description: "Firma digital del contrato y comenzamos con la gestión y cobro automático"
    }
];

export function ProcessSteps({ type }: ProcessStepsProps) {
    const steps = type === "venta" ? ventaSteps : rentaSteps;

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        ¿Cómo funciona?
                    </h2>
                    <p className="text-xl text-[#6B7B6B]">
                        {type === "venta"
                            ? "5 pasos simples para vender tu propiedad"
                            : "5 pasos para comenzar a generar ingresos"}
                    </p>
                </motion.div>

                {/* Desktop Timeline */}
                <div className="hidden lg:block max-w-6xl mx-auto">
                    <div className="relative">
                        {/* Connection Line */}
                        <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-[#2C3E2C] via-[#B8975A] to-[#2C3E2C] rounded-full" />

                        <div className="grid grid-cols-5 gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="relative"
                                >
                                    {/* Step Number Circle */}
                                    <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center shadow-xl border-4 border-white/50">
                                        <step.icon className="w-12 h-12 text-white" />
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#2C3E2C] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
                                        <h3 className="text-lg font-bold text-[#2C3E2C] mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-[#6B7B6B] leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Vertical */}
                <div className="lg:hidden space-y-8 max-w-md mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] shadow-lg"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center shadow-lg">
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#2C3E2C] text-white flex items-center justify-center font-bold text-sm -mt-2 ml-4">
                                    {index + 1}
                                </div>
                            </div>
                            <div className="flex-1 pt-2">
                                <h3 className="text-lg font-bold text-[#2C3E2C] mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-[#6B7B6B]">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
