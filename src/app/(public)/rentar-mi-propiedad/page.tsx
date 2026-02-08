"use client";

import { PropertyHeroRentar } from "@/components/propietario/property-hero-rentar";
import { ServicesIntro } from "@/components/propietario/services-intro";
import { ProtectionCalculator } from "@/components/propietario/protection-calculator";
import { ProtectionDetail } from "@/components/propietario/protection-detail";
import { InvestigationSection } from "@/components/propietario/investigation-section";
import { ContractsDetail } from "@/components/propietario/contracts-detail";
import { AdvisorBenefits } from "@/components/propietario/advisor-benefits";
import { ProcessSteps } from "@/components/propietario/process-steps";
import { RequirementsList } from "@/components/propietario/requirements-list";
import { PropertyTestimonials } from "@/components/propietario/property-testimonials";
import { FAQProperty } from "@/components/propietario/faq-property";
import { FinalCTAProperty } from "@/components/propietario/final-cta-property";

export default function RentarMiPropiedadPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white pt-16">
            {/* 1. Hero - First Impression */}
            <PropertyHeroRentar />

            {/* 2. Services Intro - What we offer (with clickable navigation) */}
            <ServicesIntro />

            {/* 3. PROTECCIÓN DE RENTA - Core service detail (ID for scroll) */}
            <div id="proteccion">
                <ProtectionDetail />
            </div>

            {/* 4. INVESTIGACIÓN - Critical trust builder (ID for scroll) */}
            <div id="investigacion">
                <InvestigationSection />
            </div>

            {/* 5. CONTRATOS - Process clarity (ID for scroll) */}
            <div id="contratos">
                <ContractsDetail />
            </div>

            {/* 6. CALCULATOR with Pricing - Before advisor section */}
            <ProtectionCalculator />

            {/* 7. Why work with an advisor */}
            <AdvisorBenefits />

            {/* 8. Process */}
            <ProcessSteps type="renta" />

            {/* 9. Requirements */}
            <RequirementsList />

            {/* 10. Social Proof - Testimonials */}
            <PropertyTestimonials type="renta" />

            {/* 11. FAQ - Remove objections */}
            <FAQProperty type="renta" />

            {/* 12. Final CTA - Conversion */}
            <FinalCTAProperty type="renta" />
        </div>
    );
}
