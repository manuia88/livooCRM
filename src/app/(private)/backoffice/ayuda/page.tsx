import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/backoffice/PageContainer";
import { HelpCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Ayuda | Backoffice Livoo",
  description: "Centro de ayuda del backoffice.",
};

export default function BackofficeAyudaPage() {
  return (
    <PageContainer
      title="¿Necesitas ayuda?"
      subtitle="Estamos aquí para apoyarte con el uso del backoffice."
    >
      <div className="max-w-xl rounded-2xl border border-[#E5E3DB] bg-white/80 backdrop-blur-sm p-8 shadow-lg">
        <p className="text-[#6B7B6B] mb-6">
          Si tienes dudas sobre el CRM, reportes, propiedades o cualquier función del backoffice, contáctanos.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white rounded-xl px-6 font-semibold" asChild>
            <Link href="/contacto" className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Ir a contacto
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl border-[#E5E3DB]" asChild>
            <a href="mailto:contacto@livoo.mx" className="inline-flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              contacto@livoo.mx
            </a>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
