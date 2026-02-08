import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Guías | Livoo",
  description: "Guías para comprar, vender o rentar tu propiedad.",
};

export default function GuiasPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="BookOpen"
        title="Guías"
        subtitle="Consejos y guías para tu proceso de compra, venta o renta."
        badge="Livoo"
      >
        <div className="p-6 sm:p-8">
          <p className="text-[#6B7B6B] mb-6">
            Próximamente: guías y recursos. Visita nuestro blog o contáctanos si necesitas asesoría.
          </p>
          <div className="flex gap-3">
            <Button className="bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-2xl px-8 font-semibold" asChild>
              <Link href="/blog">Ir al blog</Link>
            </Button>
            <Button variant="outline" className="rounded-2xl px-8 font-semibold border-[#E5E3DB]" asChild>
              <Link href="/contacto">Contacto</Link>
            </Button>
          </div>
        </div>
      </PublicHero>
    </div>
  );
}
