import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";

export const metadata: Metadata = {
  title: "Sobre Nosotros | Livoo",
  description: "Conoce a Livoo, la plataforma inmobiliaria que conecta compradores, vendedores y agencias.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="Users"
        title="Sobre Nosotros"
        subtitle="La plataforma inmobiliaria más elegante de México. Tecnología y asesoría para tu hogar ideal."
        badge="Livoo"
      />
      <section className="py-16 bg-[#FAF8F3]/80">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#E5E3DB] p-8">
            <h2 className="text-2xl font-bold text-[#2C3E2C] mb-4">Nuestra misión</h2>
            <p className="text-[#6B7B6B] leading-relaxed mb-6">
              Conectar a las personas con su hogar ideal mediante tecnología, transparencia y un equipo de expertos.
            </p>
            <h2 className="text-2xl font-bold text-[#2C3E2C] mb-4">Contacto</h2>
            <p className="text-[#6B7B6B] leading-relaxed">
              Escríbenos a contacto@livoo.mx o visita nuestras páginas de Agencias, Vender y Rentar para más información.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
