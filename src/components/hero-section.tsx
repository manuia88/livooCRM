"use client";

import { motion } from "framer-motion";
import { Search, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");

  return (
    <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F7F4] via-white to-[#FAF8F3]">
      {/* Formas de fondo suaves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#B8975A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#556B55]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-[#E5E3DB] p-6 sm:p-8"
        >
          {/* Línea dorada */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#B8975A] to-[#D4C19C] rounded-full mb-5" />

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E2C] mb-2 leading-tight">
            Tu hogar ideal te está esperando en{" "}
            <span className="text-[#B8975A]">CDMX</span>
          </h1>
          <p className="text-[#6B7B6B] text-sm sm:text-base mb-6">
            Expertos en bienes raíces con la mejor tecnología y asesoría personalizada.
          </p>

          {/* Tabs Comprar / Rentar */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#F8F7F4] border border-[#E5E3DB] mb-5">
            <button
              onClick={() => setActiveTab("buy")}
              className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "buy"
                  ? "bg-white text-[#2C3E2C] shadow-sm"
                  : "text-[#6B7B6B] hover:text-[#2C3E2C]"
              }`}
            >
              <Home className="w-4 h-4" />
              Comprar
            </button>
            <button
              onClick={() => setActiveTab("rent")}
              className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "rent"
                  ? "bg-white text-[#2C3E2C] shadow-sm"
                  : "text-[#6B7B6B] hover:text-[#2C3E2C]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Rentar
            </button>
          </div>

          {/* Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Busca por colonia, delegación o código postal"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#E5E3DB] focus:outline-none focus:ring-2 focus:ring-[#B8975A] focus:border-transparent text-[#2C3E2C] placeholder-[#9CA3AF] bg-white text-sm sm:text-base"
            />
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-xl px-6 py-3 h-auto font-semibold shadow-lg text-sm sm:text-base"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar inmuebles
            </Button>
          </div>

          {/* Indicadores */}
          <div className="mt-5 pt-5 border-t border-[#E5E3DB] flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#6B7B6B]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C4A]" />
              <span>+1,500 propiedades</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A]" />
              <span>Asesoría personalizada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C4A]" />
              <span>Trámites legales incluidos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
