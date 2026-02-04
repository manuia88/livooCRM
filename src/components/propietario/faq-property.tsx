"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQPropertyProps {
    type: "venta" | "renta";
}

export function FAQProperty({ type }: FAQPropertyProps) {
    const faqs = type === "venta" ? [
        {
            question: "¿Cuánto cuesta vender mi propiedad com Livoo?",
            answer: "Cobramos una comisión estándar del 3% más IVA al cerrar la venta. No hay costos ocultos. Todos los gastos de marketing y promoción corren por nuestra cuenta."
        },
        {
            question: "¿Cuánto tiempo tardan en vender?",
            answer: "En promedio, vendemos propiedades en 45 días, 30% más rápido que el promedio del mercado gracias a nuestra tecnología de precios y base de datos."
        },
        {
            question: "¿Necesito hacer reparaciones antes de vender?",
            answer: "Recomendamos que la propiedad esté limpia y ordenada. Nuestro asesor te dará sugerencias de 'Home Staging' básico que pueden aumentar el valor de venta sin grandes inversiones."
        },
        {
            question: "¿Qué documentos necesito?",
            answer: "Escritura pública, recibos de predial y agua al corriente, identificación oficial y acta de matrimonio (si aplica). Nosotros te ayudamos a revisar que todo esté en orden."
        }
    ] : [
        {
            question: "¿Qué documentos necesito para contratar la protección?",
            answer: "Solo necesitas Identificación Oficial, Comprobante de Domicilio y Escritura o Predial (título de propiedad). El inquilino deberá proveer sus comprobantes de ingresos e identidad."
        },
        {
            question: "¿Cuándo se firma el contrato una vez aprobada la investigación?",
            answer: "¡Inmediatamente! Gracias a nuestra tecnología de firma electrónica, el contrato puede firmarse el mismo día que se aprueba la investigación del inquilino, desde cualquier lugar."
        },
        {
            question: "¿Qué pasa si el inquilino deja de pagar?",
            answer: "Nosotros nos activamos. Iniciamos la gestión de cobranza y el proceso legal de inmediato. Si tienes la Protección Plus, nosotros te pagamos la renta mientras recuperamos el inmueble."
        },
        {
            question: "¿Hay un monto mínimo de renta para contratar?",
            answer: "Nuestras protecciones están diseñadas para rentas a partir de $4,000 MXN mensuales. Cubrimos propiedades habitacionales, comerciales y de oficinas."
        },
        {
            question: "¿Qué cubre la asesoría jurídica incluida?",
            answer: "Cubre desde dudas simples sobre el contrato hasta la representación legal completa en juicios de arrendamiento y extinción de dominio, sin costos extra de abogados."
        }
    ];

    return (
        <section className="py-24 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg">
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
