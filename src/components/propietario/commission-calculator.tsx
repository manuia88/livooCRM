"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

export function CommissionCalculator() {
    const [price, setPrice] = useState<string>("5000000");
    const commission = 0.03; // 3%

    const calculatedCommission = price ? (parseFloat(price) * commission).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    }) : "$0";

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#E5E3DB] shadow-xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] mb-4">
                                <Calculator className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-2">
                                ¿Cuánto te costaría vender?
                            </h2>
                            <p className="text-lg text-[#6B7B6B]">
                                Calcula la comisión de forma transparente
                            </p>
                        </div>

                        {/* Calculator */}
                        <div className="space-y-6">
                            {/* Price Input */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2C3E2C] mb-2">
                                    Precio de venta de tu propiedad
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#6B7B6B]">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="pl-10 h-16 text-2xl font-bold border-2 border-gray-300 focus:border-[#B8975A]"
                                    />
                                </div>
                            </div>

                            {/* Result */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#B8975A] shadow-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-[#6B7B6B]">
                                        Comisión Livoo (3%)
                                    </span>
                                    <span className="text-3xl font-bold text-[#2C3E2C]">
                                        {calculatedCommission}
                                    </span>
                                </div>
                                <p className="text-sm text-[#6B7B6B]">
                                    ✓ Incluye marketing, fotografía, visitas y cierre notarial
                                </p>
                            </div>

                            {/* CTA */}
                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white h-14 text-lg font-semibold rounded-xl shadow-lg"
                            >
                                Iniciar venta →
                            </Button>

                            {/* Info */}
                            <div className="text-center text-sm text-[#6B7B6B]">
                                <p className="mb-1">✓ Sin costos ocultos</p>
                                <p>✓ Comisión solo al cerrar la venta</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
