"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const products = [
    {
        id: "crm",
        name: "CRM",
        tagline: "Potencializa la gestión de tu agencia",
        description: "Centraliza todo en una única plataforma con IA integrada: gestiona leads con facilidad, automatiza procesos, acompaña resultados y desempeño del equipo y gestiona el portafolio de inmuebles con más eficiencia.",
        features: [
            "Dashboards intuitivos y fáciles de usar",
            "Distribución inteligente de leads",
            "Integraciones a principales portales"
        ],
        link: "/crm",
        image: "/images/products/crm.png"
    },
    {
        id: "fianza",
        name: "Fianza Inmediata",
        tagline: "La mayor fianza de México",
        description: "Renta sin complicaciones: sin fiador, sin depósito y con aprobación en hasta 1 minuto. Una solución 100% digital, rápida y segura, con cobertura de hasta 35x el valor de la renta.",
        features: [
            "Renta garantizada todos los meses",
            "Planes residenciales y empresariales",
            "Más agilidad y seguridad"
        ],
        link: "/fianza",
        image: "/images/products/fianza.png"
    },
    {
        id: "financiamiento",
        name: "Financiamiento",
        tagline: "Crédito ágil con las mejores tasas",
        description: "Financiamiento más rápido: plataforma digital integrada a los principales bancos, con simulación inmediata y envío de propuestas en pocos segundos.",
        features: [
            "Simula financiamientos rápido y gratis",
            "Plataforma multibancos",
            "Mayor intermediario de financiamiento del país"
        ],
        link: "/financiamiento",
        image: "/images/products/financiamiento.png"
    }
];

export function ProductShowcase() {
    const [activeProduct, setActiveProduct] = useState(products[0].id);
    const currentProduct = products.find(p => p.id === activeProduct) || products[0];

    return (
        <section className="py-20 bg-[#F8F7F4]">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] text-center mb-4">
                    Conoce las soluciones Livoo
                </h2>
                <p className="text-xl text-[#6B7B6B] text-center mb-12 max-w-3xl mx-auto">
                    Tecnología de punta para cada necesidad de tu agencia inmobiliaria
                </p>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => setActiveProduct(product.id)}
                            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${activeProduct === product.id
                                    ? "bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white shadow-lg"
                                    : "bg-white/80 backdrop-blur-sm text-[#2C3E2C] hover:bg-[#F1EFE8] border border-[#E5E3DB] shadow-md hover:shadow-lg"
                                }`}
                        >
                            {product.name}
                        </button>
                    ))}
                </div>

                {/* Product Content */}
                <motion.div
                    key={activeProduct}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-[#E5E3DB]/60 max-w-6xl mx-auto"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">L</span>
                                </div>
                                <span className="text-[#6B7B6B] font-medium">/ {currentProduct.name}</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-4">
                                {currentProduct.tagline}
                            </h3>

                            <p className="text-lg text-[#6B7B6B] leading-relaxed mb-8">
                                {currentProduct.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-4 mb-8">
                                {currentProduct.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#4A7C4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-[#4A7C4A]" />
                                        </div>
                                        <span className="text-[#2C3E2C]">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-full px-8"
                            >
                                {currentProduct.name} para agencias
                            </Button>
                        </div>

                        {/* Image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-[#E5E3DB]/50">
                            <div className="w-full h-full bg-gradient-to-br from-[#F8F7F4] to-[#F1EFE8] flex items-center justify-center">
                                {/* Placeholder - Replace with actual product image */}
                                <span className="text-9xl opacity-20">📱</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
