"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "¿Quién es Livoo?",
        answer: "Livoo es especialista en soluciones tecnológicas, financieras y comerciales para acelerar el viaje de compra, venta o renta de tu agencia inmobiliaria. Nuestro compromiso es crear una experiencia segura y transparente para que podamos crecer juntos, lado a lado."
    },
    {
        question: "¿Cuál es la ventaja de ser socio Livoo?",
        answer: "Al convertirte en socio Livoo, tu agencia gana acceso a un ecosistema completo: CRM, fianza, financiamiento, creación de sitios web para agencias, gestión de rentas, transferencia automática y mucho más. Todo con soporte dedicado, comisiones y tecnología de punta desarrollada para acelerar el negocio de tu agencia."
    },
    {
        question: "¿Livoo atiende agencias de cualquier tamaño?",
        answer: "Sí. Las soluciones de Livoo fueron pensadas para atender desde agencias independientes, equipos pequeños, hasta grandes redes. Un portafolio completo con soluciones tecnológicas, financieras y comerciales para todo el viaje de la agencia, de compra, venta o renta."
    },
    {
        question: "¿Necesito contratar todos los productos a la vez?",
        answer: "Puedes empezar con la solución que tenga más sentido para tu agencia según el objetivo y la necesidad. Tenemos soluciones para quien necesita vender y rentar más, organizar la agencia y también para quien necesita rentabilidad en el negocio."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 bg-[#F8F7F4]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        Principales dudas sobre las soluciones Livoo para agencias
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E5E3DB] shadow-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#F8F7F4] transition-colors"
                            >
                                <span className="font-bold text-[#2C3E2C] text-lg pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-6 h-6 text-[#B8975A] flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-8 pb-6">
                                            <p className="text-[#6B7B6B] leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
