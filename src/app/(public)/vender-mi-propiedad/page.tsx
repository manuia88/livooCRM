"use client";

import { PropertyHeroVender } from "@/components/propietario/property-hero-vender";
import { ValuationForm } from "@/components/propietario/valuation-form";
import { BenefitsGridVender } from "@/components/propietario/benefits-grid-vender";
import { ProcessSteps } from "@/components/propietario/process-steps";
import { CommissionCalculator } from "@/components/propietario/commission-calculator";
import { ServicesIncluded } from "@/components/propietario/services-included";
import { PropertyTestimonials } from "@/components/propietario/property-testimonials";
import { StatsDisplayVender } from "@/components/propietario/stats-display-vender";
import { FAQProperty } from "@/components/propietario/faq-property";
import { FinalCTAProperty } from "@/components/propietario/final-cta-property";

export default function VenderMiPropiedadPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white pt-16">
            {/* 1. Hero con imagen de fondo */}
            <PropertyHeroVender />

            {/* 2. Formulario de valuación destacado */}
            <ValuationForm type="venta" />

            {/* 3. ¿Por qué vender con Livoo? */}
            <BenefitsGridVender />

            {/* 4. Cómo funciona (Proceso en 5 pasos) */}
            <ProcessSteps type="venta" />

            {/* 5. Calculadora de comisión */}
            <CommissionCalculator />

            {/* 6. Servicios incluidos */}
            <ServicesIncluded />

            {/* 7. Testimoniales */}
            <PropertyTestimonials type="venta" />

            {/* 8. Estadísticas */}
            <StatsDisplayVender />

            {/* 9. FAQ */}
            <FAQProperty type="venta" />

            {/* 10. CTA Final */}
            <FinalCTAProperty type="venta" />
        </div>
    );
}
