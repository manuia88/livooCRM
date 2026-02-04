"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface OwnerFAQProps {
    type: "vender" | "rentar";
}

export function OwnerFAQ({ type }: OwnerFAQProps) {
    const faqs = type === "vender" ? [
        {
            question: "¿Cuánto cuesta vender mi propiedad con Livoo?",
            answer: "Cobramos una comisión estándar del mercado solo sobre el éxito de la venta. No hay costos ocultos ni pagos adelantados. La valuación y el estudio de mercado son gratuitos."
        },
        {
            question: "¿Livoo pide exclusividad?",
            answer: "No exigimos exclusiva forzosa, pero ofrecemos beneficios adicionales (como fotos destacadas y mayor inversión publicitaria) a los propietarios que nos confían la exclusiva, ya que nos permite comprometernos más recursos."
        },
        {
            question: "¿Cuánto tiempo tardan en vender?",
            answer: "El tiempo promedio varía según la zona y el precio, pero gracias a nuestra tecnología y base de datos, solemos vender 30% más rápido que el promedio del mercado."
        },
        {
            question: "¿Qué documentos necesito para empezar?",
            answer: "Para iniciar la promoción basta con confirmar que eres el propietario. Para el cierre legal, necesitarás escrituras, predial pagado, agua, luz y certificado de libertad de gravamen actualizado."
        }
    ] : [
        {
            question: "¿Cómo funciona la Garantía de Renta?",
            answer: "Si el inquilino se retrasa en su pago, nosotros cubrimos el monto de la renta el día 10 de cada mes. Así tú tienes flujo de efectivo asegurado sin importar qué pase."
        },
        {
            question: "¿Qué pasa si hay daños en mi propiedad?",
            answer: "Nuestra protección incluye un seguro de daños al inmueble y asistencia legal para cualquier controversia relacionada con el arrendamiento."
        },
        {
            question: "¿Ustedes muestran la propiedad?",
            answer: "Sí, nuestros asesores certificados se encargan de mostrar tu propiedad a los interesados, siempre con previa cita y verificando la identidad del visitante por seguridad."
        },
        {
            question: "¿Quién decide el precio de renta?",
            answer: "Nosotros te damos una recomendación basada en datos de mercado reales de tu zona, pero tú tienes la decisión final sobre el precio de lista."
        }
    ];

    return (
        <section className="py-24 bg-[#F8F7F4]">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#2C3E2C] mb-4">Preguntas Frecuentes</h2>
                    <p className="text-[#6B7B6B]">Resolvemos tus dudas sobre el proceso de {type}</p>
                </div>

                <Accordion type="single" collapsible className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-[#E5E3DB] px-6 py-2">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b-[#E5E3DB] last:border-none">
                            <AccordionTrigger className="text-left text-[#2C3E2C] font-semibold hover:text-[#B8975A] transition-colors py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#6B7B6B] pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
