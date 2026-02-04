"use client";

import { Button } from "@/components/ui/button";
import { PublicHero } from "@/components/public/PublicHero";
import { Building2 } from "lucide-react";

export function AgencyHero() {
  return (
    <PublicHero
      icon={Building2}
      title="Acelera tu operación con tecnología, seguridad y agilidad"
      subtitle="Más de 1,500 agencias inmobiliarias ya aceleran con Livoo. Únete a la red más innovadora de México."
      badge="Soluciones para agencias"
      actions={
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-2xl px-8 py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Quiero ser socio
        </Button>
      }
    />
  );
}
