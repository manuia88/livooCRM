"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicHero } from "@/components/public/PublicHero";
import { ArrowRight, KeyRound, MapPin } from "lucide-react";

export function PropertyHeroRentar() {
  return (
    <PublicHero
      icon={KeyRound}
      title="Renta tu propiedad con Livoo"
      subtitle="Ingresos garantizados todos los meses con inquilinos verificados."
      badge="Para propietarios"
      imageSrc="/images/hero-rentar-propiedad.jpg"
      imageAlt="Rentar propiedad"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-4">
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
            Calcular renta estimada
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </Button>
        </div>
      </div>
    </PublicHero>
  );
}
