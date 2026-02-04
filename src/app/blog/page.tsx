import { Metadata } from "next";
import { PublicHero } from "@/components/public/PublicHero";

export const metadata: Metadata = {
  title: "Blog | Livoo",
  description: "Artículos y guías sobre bienes raíces.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <PublicHero
        iconName="FileText"
        title="Blog"
        subtitle="Guías, tendencias y consejos sobre bienes raíces."
        badge="Livoo"
      />
      <section className="py-16 bg-[#FAF8F3]/80">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#E5E3DB] p-8">
            <p className="text-[#6B7B6B] leading-relaxed">
              Próximamente: artículos y recursos. Misma línea visual que el backoffice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
