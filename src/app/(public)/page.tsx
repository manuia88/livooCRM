import { HeroSection } from "@/components/hero-section";
import { CityBadges } from "@/components/city-badges";
import { ServiceCards } from "@/components/service-cards";
import { FilterPills } from "@/components/filter-pills";
import { PropertyCard } from "@/components/property-card";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { getFeaturedProperties } from "@/services/property-service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. City Badges */}
      <CityBadges />

      {/* 3. Service Cards - All 5 in one row */}
      <ServiceCards />

      {/* 4. Featured Properties - Estilo Apple */}
      <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E5E3DB] p-8 sm:p-12">
          {/* Section Header */}
          <div className="text-center mb-12 p-6 rounded-2xl bg-[#FAF8F3]/80 border border-[#E5E3DB]/60">
            <div className="w-20 h-1 bg-gradient-to-r from-[#B8975A] to-[#D4C19C] rounded-full mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
              Descubre tu nuevo hogar
            </h2>
            <p className="text-lg text-[#6B7B6B] max-w-2xl mx-auto">
              La selección más exclusiva del mercado inmobiliario en México.
            </p>
          </div>

          {/* Filter Pills */}
          <FilterPills />

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featuredProperties.slice(0, 8).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center pt-4">
            <Link href="/propiedades">
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-2 border-[#B8975A] text-[#B8975A] hover:bg-[#FAF8F3] hover:border-[#A38449] px-8 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                Ver todas las propiedades
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <CTASection />

      {/* 6. Footer (Included here or in layout) */}
      <Footer />
    </div>
  );
}
