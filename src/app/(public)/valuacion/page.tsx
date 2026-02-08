import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Valuación Gratuita | Livoo",
  description: "Conoce el valor de tu propiedad con nuestra valuación gratuita.",
};

export default function ValuacionPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="Calculator"
        title="Valuación gratuita de tu propiedad"
        subtitle="Obtén una estimación de valor basada en datos del mercado en minutos."
        badge="Sin compromiso"
      >
        <div className="p-6 sm:p-8">
          <p className="text-[#6B7B6B] mb-6">
            Ingresa los datos de tu inmueble y recibe una valuación preliminar. Un asesor puede afinar el resultado con una visita.
          </p>
          <Link href="/vender-mi-propiedad">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-2xl px-8 font-semibold shadow-lg"
            >
              Ir a valuación completa
            </Button>
          </Link>
        </div>
      </PublicHero>
    </div>
  );
}
