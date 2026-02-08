import { Metadata } from "next";
import { AgencyHero } from "@/components/agency/agency-hero";
import { PartnersLogos } from "@/components/agency/partners-logos";
import { SolutionsByChallenge } from "@/components/agency/solutions-by-challenge";
import { CertificationBadge } from "@/components/agency/certification-badge";
import { ProductShowcase } from "@/components/agency/product-showcase";
import { TestimonialsSection } from "@/components/agency/testimonials-section";
import { ClubLivoo } from "@/components/agency/club-livoo";
import { StatsCounter } from "@/components/agency/stats-counter";
import { FinalCTA } from "@/components/agency/final-cta";
import { FAQSection } from "@/components/agency/faq-section";

export const metadata: Metadata = {
    title: "Soluciones para Agencias Inmobiliarias | Livoo",
    description: "Acelera tu agencia inmobiliaria con tecnología, seguridad y agilidad. Más de 1,500 agencias ya crecen con Livoo.",
};

export default function AgenciasPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. Hero Section */}
            <AgencyHero />

            {/* 2. Partners Logos */}
            <PartnersLogos />

            {/* 3. Solutions by Challenge */}
            <SolutionsByChallenge />

            {/* 4. Certification Badge + Integrated Solutions */}
            <CertificationBadge />

            {/* 5. Product Showcase (Tabs with Products) */}
            <ProductShowcase />

            {/* 6. Testimonials */}
            <TestimonialsSection />

            {/* 7. Club Livoo */}
            <ClubLivoo />

            {/* 8. Stats Counter */}
            <StatsCounter />

            {/* 9. Final CTA */}
            <FinalCTA />

            {/* 10. FAQ */}
            <FAQSection />
        </div>
    );
}
