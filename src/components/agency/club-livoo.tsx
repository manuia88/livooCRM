"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const tiers = [
    {
        name: "Plata",
        icon: Award,
        color: "from-[#C0C0C0] to-[#E5E5E5]",
        image: "/images/club/plata.webp"
    },
    {
        name: "Oro",
        icon: Star,
        color: "from-[#FFD700] to-[#FFA500]",
        image: "/images/club/oro.webp"
    },
    {
        name: "Diamante",
        icon: TrendingUp,
        color: "from-[#B9F2FF] to-[#00B4D8]",
        image: "/images/club/diamante.webp"
    },
    {
        name: "Titanio",
        icon: Trophy,
        color: "from-[#708090] to-[#2F4F4F]",
        image: "/images/club/titanio.webp"
    }
];

export function ClubLivoo() {
    return (
        <section className="py-20 bg-gradient-to-br from-[#F8F7F4] via-white to-[#FAF8F3] relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 right-20 w-96 h-96 bg-[#B8975A] rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#2C3E2C] rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        Club Livoo
                    </h2>
                    <p className="text-xl text-[#6B7B6B] max-w-3xl mx-auto">
                        El programa de relacionamiento creado para premiar agencias asociadas que aceleran con las soluciones Livoo
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
                    {/* Left side - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-lg text-[#6B7B6B] leading-relaxed mb-6">
                            A cada negocio cerrado, tu agencia acumula puntos, avanza de categoría y desbloquea nuevos beneficios.
                        </p>
                        <p className="text-lg text-[#6B7B6B] leading-relaxed mb-8">
                            Son cuatro categorías de reconocimiento — <span className="font-semibold text-[#2C3E2C]">Plata, Oro, Diamante y Titanio</span> — con acceso a ventajas exclusivas, capacitación continua y participación en eventos especiales.
                        </p>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#E5E3DB] shadow-lg mb-8">
                            <h3 className="font-bold text-[#2C3E2C] mb-4">Beneficios del Club:</h3>
                            <ul className="space-y-3">
                                {[
                                    "Comisiones premium por cada transacción",
                                    "Capacitaciones exclusivas y certificaciones",
                                    "Eventos VIP y networking",
                                    "Soporte prioritario 24/7",
                                    "Acceso anticipado a nuevos productos"
                                ].map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#4A7C4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[#4A7C4A] font-bold text-xs">✓</span>
                                        </div>
                                        <span className="text-[#6B7B6B]">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-full px-10 shadow-xl h-auto"
                        >
                            Participar del Club Livoo
                        </Button>
                    </motion.div>

                    {/* Right side - Tiers */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="aspect-square rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-[#E5E3DB] p-6 flex flex-col items-center justify-center hover:border-[#B8975A] transition-all duration-300 shadow-lg hover:shadow-2xl">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <tier.icon className="w-12 h-12 text-white" />
                                    </div>
                                    <h4 className="font-bold text-[#2C3E2C] text-lg">{tier.name}</h4>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
                            {/* Placeholder - Add real event photos */}
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl opacity-20">📸</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
