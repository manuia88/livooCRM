import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { PropertyCard } from "@/components/property-card";
import { getFeaturedProperties } from "@/services/property-service";

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section (Client Component) */}
      <HeroSection />

      {/* Trust/Social Proof Section */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
            Presente en las zonas más exclusivas
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale transition-all hover:grayscale-0">
            {/* Logos placeholders */}
            <span className="text-xl font-bold">CDMX</span>
            <span className="text-xl font-bold">GUADALAJARA</span>
            <span className="text-xl font-bold">MONTERREY</span>
            <span className="text-xl font-bold">TULUM</span>
            <span className="text-xl font-bold">CABOS</span>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Propiedades Destacadas</h2>
              <p className="text-muted-foreground">La selección más exclusiva del mercado.</p>
            </div>
            <Link href="/propiedades">
              <Button variant="link" className="text-accent">Ver todas <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>

          {/* Server Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.length > 0 ? (
              featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-white rounded-xl border border-dashed border-border text-muted-foreground">
                <p>No hay propiedades destacadas disponibles en este momento.</p>
                <p className="text-sm mt-2">Intenta visitar <code>/api/seed</code> para poblar la base de datos.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B49B57_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para encontrar tu hogar ideal?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestros expertos están listos para guiarte en cada paso de la compra o renta.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="gold" size="lg" className="px-8">Contáctanos</Button>
            <Link href="/propiedades">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
                Explorar Propiedades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="mt-auto py-8 text-center text-sm text-muted-foreground bg-surface">
        <div className="container mx-auto">
          © 2024 PropiedadesMX. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
