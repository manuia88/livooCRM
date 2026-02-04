"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
    {
        value: "1,500",
        label: "Agencias asociadas",
        prefix: "+",
        suffix: ""
    },
    {
        value: "50",
        label: "Millones de clientes analizados",
        prefix: "+",
        suffix: "M"
    },
    {
        value: "32",
        label: "Ciudades",
        prefix: "",
        suffix: ""
    },
    {
        value: "45",
        label: "Mil contratos bajo gestión",
        prefix: "+",
        suffix: "K"
    },
    {
        value: "150",
        label: "Mil clientes atendidos en CRM",
        prefix: "+",
        suffix: "K"
    },
    {
        value: "85",
        label: "Mil usuarios activos en la plataforma",
        prefix: "",
        suffix: "K"
    }
];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        // Clean value string to number
        const numValue = parseInt(value.toString().replace(/,/g, ''), 10);

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                setCount(Math.floor(numValue * progress));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(numValue);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isInView, value, duration]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function StatsCounter() {
    return (
        <section className="py-20 bg-gradient-to-br from-[#2C3E2C] to-[#3F5140] text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B8975A] rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7D8F77] rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        ¿Livoo vale la pena?
                    </h2>
                    <p className="text-xl text-gray-300">
                        Resultados que hablan por sí mismos
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300"
                        >
                            <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-[#B8975A] to-[#D4C19C] bg-clip-text text-transparent">
                                {stat.prefix}
                                <Counter value={parseInt(stat.value.replace(/,/g, ''))} />
                                {stat.suffix}
                            </div>
                            <p className="text-gray-300">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
