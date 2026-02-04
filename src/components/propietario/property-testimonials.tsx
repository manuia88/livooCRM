"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface PropertyTestimonialsProps {
    type: "venta" | "renta";
}

export function PropertyTestimonials({ type }: PropertyTestimonialsProps) {
    const testimonials = type === "venta" ? [
        {
            name: "María González",
            location: "Polanco",
            text: "Vendí mi departamento en 2 semanas con Livoo. El proceso fue increíblemente fácil y obtuve el precio que buscaba.",
            image: "/images/testimonial-1.jpg"
        },
        {
            name: "Roberto Díaz",
            location: "Condesa",
            text: "La valuación fue muy precisa. Me impresionó la calidad de las fotos y la cantidad de interesados reales que trajeron.",
            image: "/images/testimonial-2.jpg"
        },
        {
            name: "Ana S.",
            location: "Roma Norte",
            text: "Excelente servicio de acompañamiento legal. Me sentí segura en todo momento hasta la firma de escrituras.",
            image: "/images/testimonial-3.jpg"
        }
    ] : [
        {
            name: "Carlos Ruiz",
            location: "Santa Fe",
            text: "Desde que Livoo administra mi departamento, recibo mi renta puntual el día 10 sin falta. Es una tranquilidad total.",
            image: "/images/testimonial-1.jpg"
        },
        {
            name: "Laura Méndez",
            location: "Del Valle",
            text: "Me consiguieron inquilinos excelentes en menos de 10 días. La investigación que hacen es muy rigurosa.",
            image: "/images/testimonial-2.jpg"
        },
        {
            name: "Jorge P.",
            location: "Nápoles",
            text: "El plan premium vale cada centavo. Se encargan de todo el mantenimiento y yo solo veo los depósitos.",
            image: "/images/testimonial-3.jpg"
        }
    ];

    return (
        <section className="py-24 bg-[#2C3E2C] text-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-[#B8975A] text-sm font-semibold tracking-widest uppercase mb-4 block">
                        Historias de Éxito
                    </span>
                    <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros propietarios</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-lg hover:bg-white/10 hover:shadow-xl transition-all duration-300"
                        >
                            <Quote className="w-10 h-10 text-[#B8975A] mb-6 opacity-50" />
                            <p className="text-lg text-gray-200 mb-8 leading-relaxed italic">
                                "{testimonial.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gray-400 animate-pulse" />
                                    {/* Placeholder if image loads */}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{testimonial.name}</div>
                                    <div className="text-sm text-[#B8975A]">{testimonial.location}</div>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className="w-3 h-3 text-[#B8975A] fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
