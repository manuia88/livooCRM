import { Metadata } from "next";
import { OwnerHero } from "@/components/owners/owner-hero";
import { OwnerBenefits } from "@/components/owners/owner-benefits";
import { OwnerProcess } from "@/components/owners/owner-process";
import { OwnerFAQ } from "@/components/owners/owner-faq";
import { OwnerFinalAction } from "@/components/owners/owner-final-action";

export const metadata: Metadata = {
    title: "Vende tu Propiedad | Livoo Bienes Raíces",
    description: "Vende tu casa o departamento rápido y al mejor precio. Valuación gratuita y marketing profesional.",
};

export default function VenderPage() {
    return (
        <main className="min-h-screen pt-20">
            <OwnerHero
                type="vender"
                title="Vende tu propiedad al mejor precio y sin estrés"
                subtitle="Tecnología de punta y asesores expertos para vender tu inmueble más rápido que el promedio del mercado."
                imageSrc="/images/hero-vender.webp"
            />
            <OwnerBenefits type="vender" />
            <OwnerProcess type="vender" />
            <OwnerFAQ type="vender" />
            <OwnerFinalAction type="vender" />
        </main>
    );
}
