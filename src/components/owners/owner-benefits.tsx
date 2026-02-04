"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, TrendingUp, Users, Camera, FileCheck } from "lucide-react";

interface Benefit {
    icon: any;
    title: string;
    description: string;
}

interface OwnerBenefitsProps {
    type: "vender" | "rentar";
}

export function OwnerBenefits({ type }: OwnerBenefitsProps) {
    const benefits: Benefit[] = type === "vender" ? [
        {
            icon: TrendingUp,
            title: "Valuación Inteligente",
            description: "Utilizamos Big Data para definir el precio óptimo de tu propiedad y venderla al mejor valor del mercado."
        },
        {
            icon: Camera,
            title: "Marketing Premium",
            description: "Fotos profesionales, tour virtual 360° y campañas destacadas en los principales portales inmobiliarios."
        },
        {
            icon: Users,
            title: "Red de Compradores",
            description: "Acceso inmediato a nuestra base de datos de compradores pre-calificados buscando propiedades como la tuya."
        },
        {
            icon: FileCheck,
            title: "Gestión Legal Total",
            description: "Nos encargamos de todo el papeleo, contratos y trámites notariales para garantizar una venta segura."
        }
    ] : [
        {
            icon: ShieldCheck,
            title: "Renta Garantizada",
            description: "Si el inquilino no paga, nosotros te pagamos. Garantizamos tu renta mes a mes sin falta."
        },
        {
            icon: Users,
            title: "Inquilinos Verificados",
            description: "Investigación exhaustiva de antecedentes, buró de crédito y referencias laborales de cada candidato."
        },
        {
            icon: FileCheck,
            title: "Contratos Digitales",
            description: "Firma de contratos 100% digital, sin burocracia y con validez legal completa."
        },
        {
            icon: Clock,
            title: "Renta en Tiempo Récord",
            description: "Promedio de renta en menos de 25 días gracias a nuestra tecnología y marketing agresivo."
        }
    ];

    return (
        <section className="py-24 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
                    <span className="text-[#B8975A] font-semibold tracking-wider uppercase text-sm">¿Por qué elegir Livoo?</span>
                    <h2 className="text-4xl font-bold text-[#2C3E2C] mt-2 mb-6">
                        La forma más inteligente de {type === "vender" ? "vender" : "rentar"} tu propiedad
                    </h2>
                    <p className="text-[#6B7B6B] text-lg">
                        Combinamos tecnología de punta con expertos inmobiliarios para brindarte una experiencia sin fricciones.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-[#E5E3DB] shadow-lg hover:border-[#B8975A]/30 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <benefit.icon className="w-7 h-7 text-[#B8975A]" />
                            </div>

                            <h3 className="text-xl font-bold text-[#2C3E2C] mb-3">{benefit.title}</h3>
                            <p className="text-[#6B7B6B] leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
