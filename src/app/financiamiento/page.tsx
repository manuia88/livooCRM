import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Financiamiento | Livoo",
  description: "Opciones de financiamiento para tu vivienda.",
};

export default function FinanciamientoPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="Landmark"
        title="Financiamiento"
        subtitle="Te ayudamos a encontrar las mejores opciones de crédito para tu vivienda."
        badge="Livoo"
      >
        <div className="p-6 sm:p-8">
          <p className="text-[#6B7B6B] mb-6">
            Próximamente: simuladores y asesoría en financiamiento. Mientras tanto, contáctanos para más información.
          </p>
          <Button className="bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-2xl px-8 font-semibold" asChild>
            <Link href="/contacto">Contactar</Link>
          </Button>
        </div>
      </PublicHero>
    </div>
  );
}
