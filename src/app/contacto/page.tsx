import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contacto | Livoo",
  description: "Contacta a Livoo.",
};

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="Mail"
        title="Contacto"
        subtitle="Escríbenos o llámanos. Estamos para ayudarte."
        badge="Livoo"
      >
        <div className="p-6 sm:p-8">
          <p className="text-[#6B7B6B] mb-4">contacto@livoo.mx</p>
          <p className="text-[#6B7B6B] mb-6">+52 55 1234 5678</p>
          <Button
            className="bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-2xl px-8 font-semibold"
            asChild
          >
            <a href="mailto:contacto@livoo.mx">Enviar correo</a>
          </Button>
        </div>
      </PublicHero>
    </div>
  );
}
