"use client";

import { motion } from "framer-motion";

export function StatsDisplayVender() {
    const stats = [
        { value: "45", label: "Días promedio", sub: "Para vender tu propiedad" },
        { value: "98%", label: "Precio objetivo", sub: "Del valor de valuación alcanzado" },
        { value: "+2.5k", label: "Ventas exitosas", sub: "En el último año" },
        { value: "4.9/5", label: "Satisfacción", sub: "Calificación de clientes" }
    ];

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-[#E5E3DB] shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="text-5xl font-bold text-[#B8975A] mb-2">{stat.value}</div>
                            <div className="text-lg font-bold text-[#2C3E2C] mb-1">{stat.label}</div>
                            <div className="text-sm text-[#6B7B6B]">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
