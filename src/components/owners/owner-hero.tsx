"use client";

import { Button } from "@/components/ui/button";
import { PublicHero } from "@/components/public/PublicHero";
import { ArrowRight, Home } from "lucide-react";

interface OwnerHeroProps {
  type: "vender" | "rentar";
  title: string;
  subtitle: string;
  imageSrc: string;
}

export function OwnerHero({ type, title, subtitle, imageSrc }: OwnerHeroProps) {
  return (
    <PublicHero
      icon={Home}
      title={title}
      subtitle={subtitle}
      badge={type === "vender" ? "Venta garantizada" : "Renta segura"}
      imageSrc={imageSrc}
      imageAlt={type === "vender" ? "Vender propiedad" : "Rentar propiedad"}
      actions={
        <Button
          size="lg"
          className="bg-[#B8975A] hover:bg-[#A38449] text-white rounded-2xl px-8 py-3.5 font-semibold shadow-lg border-0"
        >
          {type === "vender" ? "Valuar mi propiedad gratis" : "Quiero rentar seguro"}
        </Button>
      }
    >
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#2C3E2C] mb-2">Comienza ahora</h3>
        <p className="text-[#6B7B6B] text-sm mb-6">
          Déjanos tus datos y recibe una propuesta personalizada en menos de 24 h.
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F7F4] border border-[#E5E3DB] focus:bg-white focus:border-[#B8975A] focus:ring-2 focus:ring-[#B8975A]/20 outline-none text-[#2C3E2C] transition-all"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F7F4] border border-[#E5E3DB] focus:bg-white focus:border-[#B8975A] focus:ring-2 focus:ring-[#B8975A]/20 outline-none text-[#2C3E2C] transition-all"
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F7F4] border border-[#E5E3DB] focus:bg-white focus:border-[#B8975A] focus:ring-2 focus:ring-[#B8975A]/20 outline-none text-[#2C3E2C] transition-all"
              placeholder="+52 55 1234 5678"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-2xl py-3.5 font-semibold shadow-lg"
          >
            Enviar solicitud <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Button>
          <p className="text-xs text-[#6B7B6B] text-center mt-4">
            Al enviar, aceptas nuestros términos y condiciones de privacidad.
          </p>
        </form>
      </div>
    </PublicHero>
  );
}
