"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function FinalCTA() {
    return (
        <section className="py-20 bg-[#FAF8F3]/60 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#E5E3DB] shadow-xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-6">
                            ¿Aún no estás seguro si Livoo es para ti?
                        </h2>
                        <p className="text-xl text-[#6B7B6B] mb-8 leading-relaxed">
                            Habla con un especialista y descubre si Livoo es el socio ideal para tu agencia inmobiliaria.
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-full px-10 py-6 text-lg font-semibold shadow-xl h-auto"
                        >
                            Quiero entender mejor
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-[#E5E3DB]/60"
                    >
                        {/* Placeholder - Replace with actual image */}
                        <div className="w-full h-full bg-gradient-to-br from-[#F8F7F4] to-[#F1EFE8] flex items-center justify-center">
                            <span className="text-9xl opacity-20">🤝</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
