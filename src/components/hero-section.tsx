"use client";

import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
            {/* Abstract Background - placeholder for video later */}
            <div className="absolute inset-0 z-0 bg-primary">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.4),rgba(15,23,42,0.8))] z-10" />

                {/* Animated Grid or Subtle Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B49B57_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <div className="relative z-20 container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight text-balance"
                >
                    Descubre tu lugar <br className="hidden md:block" />
                    <span className="text-accent italic">extraordinario</span> en México.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
                >
                    La plataforma inmobiliaria más exclusiva, diseñada para quienes exigen lo mejor.
                </motion.p>

                {/* Search Bar Component */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white p-2 rounded-xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2 items-center"
                >
                    <div className="flex bg-surface rounded-lg px-4 py-3 flex-1 w-full items-center gap-2">
                        <MapPin className="text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Polanco, Lomas, Roma Norte..."
                            className="bg-transparent border-none outline-none w-full text-foreground placeholder-muted-foreground"
                        />
                    </div>

                    <Button variant="gold" size="lg" className="w-full md:w-auto">
                        <Search className="mr-2 h-4 w-4" /> Buscar
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
