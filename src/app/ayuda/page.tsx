import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ayuda | Livoo",
  description: "Centro de ayuda y preguntas frecuentes.",
};

export default function AyudaPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="HelpCircle"
        title="Ayuda"
        subtitle="Estamos aquí para resolver tus dudas."
        badge="Livoo"
      >
        <div className="p-6 sm:p-8">
          <p className="text-[#6B7B6B] mb-6">
            ¿Necesitas ayuda? Escríbenos o llámanos y te atenderemos lo antes posible.
          </p>
          <Button className="bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-2xl px-8 font-semibold" asChild>
            <Link href="/contacto">Ir a contacto</Link>
          </Button>
        </div>
      </PublicHero>
    </div>
  );
}
