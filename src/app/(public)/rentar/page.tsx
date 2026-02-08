import { Metadata } from "next";
import { OwnerHero } from "@/components/owners/owner-hero";
import { OwnerBenefits } from "@/components/owners/owner-benefits";
import { OwnerProcess } from "@/components/owners/owner-process";
import { OwnerFAQ } from "@/components/owners/owner-faq";
import { OwnerFinalAction } from "@/components/owners/owner-final-action";

export const metadata: Metadata = {
    title: "Renta tu Propiedad Seguro | Livoo Bienes Raíces",
    description: "Renta sin riesgos. Garantizamos tu pago cada mes y verificamos rigurosamente a los inquilinos.",
};

export default function RentarPage() {
    return (
        <main className="min-h-screen pt-20">
            <OwnerHero
                type="rentar"
                title="Renta tu propiedad con pago garantizado día 10"
                subtitle="Olvídate de cobrar rentas. Nosotros te garantizamos el pago puntual cada mes, pague o no el inquilino."
                imageSrc="/images/hero-rentar.webp"
            />
            <OwnerBenefits type="rentar" />
            <OwnerProcess type="rentar" />
            <OwnerFAQ type="rentar" />
            <OwnerFinalAction type="rentar" />
        </main>
    );
}
