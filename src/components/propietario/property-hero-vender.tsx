"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicHero } from "@/components/public/PublicHero";
import { ArrowRight, Home, MapPin } from "lucide-react";

export function PropertyHeroVender() {
  return (
    <PublicHero
      icon={Home}
      title="Vende tu propiedad con Livoo"
      subtitle="Obtén el mejor precio del mercado con nuestra tecnología de valuación."
      badge="Para propietarios"
      imageSrc="/images/hero-vender-propiedad.jpg"
      imageAlt="Vender propiedad"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7B6B]" />
            <Input
              placeholder="Dirección de tu propiedad"
              className="pl-10 h-14 text-base rounded-2xl border-2 border-[#E5E3DB] focus:border-[#B8975A]"
            />
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white h-14 px-8 text-lg font-semibold rounded-2xl shadow-lg"
          >
            Obtener valuación gratis
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 pt-4 border-t border-[#E5E3DB]">
          {[
            { label: "+2,500", sublabel: "Propiedades vendidas" },
            { label: "45 días", sublabel: "Tiempo promedio de venta" },
            { label: "3%", sublabel: "Comisión competitiva" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-xl font-bold text-[#B8975A]">{stat.label}</div>
              <div className="text-sm text-[#6B7B6B]">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </PublicHero>
  );
}
