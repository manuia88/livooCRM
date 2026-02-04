"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const cities = [
    { name: "Cuauhtémoc", code: "CU", image: "/images/alcaldias/cuauhtemoc.png" },
    { name: "Miguel Hidalgo", code: "MH", image: "/images/alcaldias/miguel-hidalgo.png" },
    { name: "Benito Juárez", code: "BJ", image: "/images/alcaldias/benito-juarez.png" },
];

export function CityBadges() {
    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14 p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-3">
                        Explora las Mejores Alcaldías de CDMX
                    </h2>
                    <p className="text-lg text-[#6B7B6B] max-w-2xl mx-auto">
                        Encuentra Tu Hogar en las Zonas Más Exclusivas de la Ciudad
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
                        {cities.map((city, index) => (
                            <motion.div
                                key={city.code}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12, duration: 0.4 }}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="relative w-full aspect-[4/5] max-w-sm rounded-2xl overflow-hidden shadow-xl border border-[#E5E3DB]/60 bg-[#F8F7F4] group-hover:shadow-2xl group-hover:shadow-[#2C3E2C]/10 group-hover:scale-[1.02] group-hover:border-[#B8975A]/40 transition-all duration-300">
                                    <Image
                                        src={city.image}
                                        alt={city.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E2C]/90 via-[#2C3E2C]/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-12">
                                        <span className="text-lg font-bold text-white drop-shadow-md">
                                            {city.name}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-[#E5E3DB]">
                                        <span className="text-xs font-bold text-[#2C3E2C] tracking-wide">{city.code}</span>
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl border-2 border-[#B8975A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
