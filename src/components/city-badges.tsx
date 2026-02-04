"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const cities = [
    { name: "Cuauhtémoc", code: "CU", image: "/images/alcaldias/cuauhtemoc.png" },
    { name: "Miguel Hidalgo", code: "MH", image: "/images/alcaldias/miguel-hidalgo.png" },
    { name: "Benito Juárez", code: "BJ", image: "/images/alcaldias/benito-juarez.png" },
    { name: "Álvaro Obregón", code: "AO", image: "/images/alcaldias/alvaro-obregon.png" },
    { name: "Cuajimalpa", code: "CJ", image: "/images/alcaldias/cuajimalpa.png" }
];

export function CityBadges() {
    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-3">
                        Explora las Mejores Alcaldías de CDMX
                    </h2>
                    <p className="text-lg text-[#6B7B6B] max-w-2xl mx-auto">
                        Encuentra Tu Hogar en las Zonas Más Exclusivas de la Ciudad
                    </p>
                </motion.div>

                {/* Grid Layout - 2 cards top row, 3 cards bottom row */}
                <div className="max-w-7xl mx-auto">
                    {/* Top Row - 2 Cards Centered */}
                    <div className="flex justify-center gap-8 mb-8">
                        {cities.slice(0, 2).map((city, index) => (
                            <motion.div
                                key={city.code}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center gap-4 group cursor-pointer"
                            >
                                {/* Image Card with Hover Effects */}
                                <div className="relative w-80 h-80 rounded-3xl overflow-hidden shadow-xl border border-[#E5E3DB]/60 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
                                    {/* Image */}
                                    <Image
                                        src={city.image}
                                        alt={city.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E2C]/80 via-[#2C3E2C]/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                                    {/* Code Badge */}
                                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E5E3DB]">
                                        <span className="text-sm font-bold text-[#2C3E2C]">{city.code}</span>
                                    </div>

                                    {/* Hover Border */}
                                    <div className="absolute inset-0 border-2 border-[#B8975A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                                </div>

                                {/* Name Label */}
                                <span className="text-lg font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] transition-colors duration-300">
                                    {city.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Row - 3 Cards Centered */}
                    <div className="flex justify-center gap-8">
                        {cities.slice(2, 5).map((city, index) => (
                            <motion.div
                                key={city.code}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (index + 2) * 0.1 }}
                                className="flex flex-col items-center gap-4 group cursor-pointer"
                            >
                                {/* Image Card with Hover Effects */}
                                <div className="relative w-80 h-80 rounded-3xl overflow-hidden shadow-xl border border-[#E5E3DB]/60 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
                                    {/* Image */}
                                    <Image
                                        src={city.image}
                                        alt={city.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E2C]/80 via-[#2C3E2C]/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                                    {/* Code Badge */}
                                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E5E3DB]">
                                        <span className="text-sm font-bold text-[#2C3E2C]">{city.code}</span>
                                    </div>

                                    {/* Hover Border */}
                                    <div className="absolute inset-0 border-2 border-[#B8975A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                                </div>

                                {/* Name Label */}
                                <span className="text-lg font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] transition-colors duration-300">
                                    {city.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
