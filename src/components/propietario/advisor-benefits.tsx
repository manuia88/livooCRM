"use client";

import { motion } from "framer-motion";
import { DollarSign, Camera, Megaphone, Calendar, Users, Headphones, Handshake, TrendingUp } from "lucide-react";

export function AdvisorBenefits() {
    const benefits = [
        {
            icon: DollarSign,
            title: "Definición de Precio Justo de Renta",
            description: "Con base en un análisis del mercado y la zona."
        },
        {
            icon: Camera,
            title: "Preparación del Inmueble",
            description: "Fotografías profesionales y material atractivo para destacar tu propiedad."
        },
        {
            icon: Megaphone,
            title: "Promoción y Difusión",
            description: "Publicación del inmueble en portales y redes para alcanzar más prospectos."
        },
        {
            icon: Calendar,
            title: "Coordinación de Visitas",
            description: "Agenda y gestión de recorridos al inmueble con posibles inquilinos."
        },
        {
            icon: Users,
            title: "Perfilamiento y Selección",
            description: "Evaluación de prospectos para elegir al inquilino más confiable."
        },
        {
            icon: Headphones,
            title: "Comunicación y Seguimiento",
            description: "Informado e interesado en cada paso del proceso, hasta el cierre de la transacción."
        },
        {
            icon: Handshake,
            title: "Negociación de Condiciones",
            description: "Apoyo en la definición de términos clave: renta, depósito, plazos y condiciones."
        },
        {
            icon: TrendingUp,
            title: "Asesoría Estratégica",
            description: "Recomendaciones para tu arrendamiento y asegura una experiencia exitosa."
        }
    ];

    return (
        <section className="py-20 bg-[#1E2B1E] text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#B8975A] rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#556B55] rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Un Asesor Livoo Te Acompañará en Todo el Proceso
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Especializado en cada etapa del arrendamiento
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/10 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#B8975A] flex items-center justify-center mb-4">
                                <benefit.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
