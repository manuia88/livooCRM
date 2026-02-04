"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, Shield, BarChart, Handshake, CreditCard } from "lucide-react";

const benefits = [
    {
        icon: TrendingUp,
        title: "Mejor Precio del Mercado",
        description: "Tecnología de valuación que garantiza el precio más justo basado en datos reales",
        gradient: "from-[#2C3E2C] to-[#556B55]"
    },
    {
        icon: Zap,
        title: "Venta Rápida",
        description: "Red de +1,500 agencias y miles de compradores activos buscando propiedades",
        gradient: "from-[#556B55] to-[#7D8F77]"
    },
    {
        icon: Shield,
        title: "Proceso Seguro",
        description: "Acompañamiento legal completo de principio a fin con especialistas",
        gradient: "from-[#7D8F77] to-[#A8B5A1]"
    },
    {
        icon: BarChart,
        title: "Marketing Premium",
        description: "Fotografía profesional y promoción en todos los portales inmobiliarios",
        gradient: "from-[#B8975A] to-[#C4A872]"
    },
    {
        icon: Handshake,
        title: "Sin Exclusividad",
        description: "Vende con nosotros sin compromisos de exclusividad, total flexibilidad",
        gradient: "from-[#A38449] to-[#B8975A]"
    },
    {
        icon: CreditCard,
        title: "Financiamiento",
        description: "Ayudamos a tu comprador a obtener el crédito hipotecario en tiempo récord",
        gradient: "from-[#C4A872] to-[#D4C19C]"
    }
];

export function BenefitsGridVender() {
    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        ¿Por qué vender con Livoo?
                    </h2>
                    <p className="text-xl text-[#6B7B6B] max-w-3xl mx-auto">
                        La combinación perfecta de tecnología, experiencia y alcance para vender tu propiedad
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E3DB] hover:border-[#B8975A]">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <benefit.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[#2C3E2C] mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-[#6B7B6B] leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
