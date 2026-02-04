"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
    {
        id: 1,
        quote: "Desde hace más de seis años contamos con esta alianza, que ha sido fundamental para facilitar todo el proceso de fianza de los inquilinos e impulsar de forma exponencial nuestra cartera de rentas.",
        author: "Pedro Granada",
        company: "Pedro Granada Inmuebles",
        avatar: "/images/testimonials/pedro.jpg"
    },
    {
        id: 2,
        quote: "El CRM de Livoo es un brazo que ayuda al asesor en todos los aspectos. Todo está compartido y organizado, con base de datos, visitas, propuestas, inmuebles, filtro y embudo de ventas.",
        author: "Thiago Alves",
        company: "Real Up Inmuebles",
        avatar: "/images/testimonials/thiago.jpg"
    },
    {
        id: 3,
        quote: "La fianza de Livoo nos ayudó a nosotros y a nuestros clientes en todo el proceso de renta. Vimos mucha facilidad en la aprobación del registro y mucha agilidad. Hoy el cliente puede retirar las llaves el mismo día.",
        author: "Ana Paula Pérez",
        company: "Inmobiliaria Pérez",
        avatar: "/images/testimonials/ana.jpg"
    },
    {
        id: 4,
        quote: "El Asistente Livoo me ha ayudado mucho, principalmente en el momento del cierre, por la practicidad y agilidad en el servicio. Consigo presentar de forma inmediata diversos escenarios de financiamiento.",
        author: "Mauricio Andrade",
        company: "VOX16 inmuebles",
        avatar: "/images/testimonials/mauricio.jpg"
    }
];

export function TestimonialsSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="py-20 bg-[#FAF8F3]/60 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        ¿Livoo es confiable?
                    </h2>
                    <p className="text-xl text-[#6B7B6B]">
                        Vea lo que dicen nuestros clientes
                    </p>
                </div>

                {/* Main Testimonial */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#E5E3DB] shadow-xl"
                    >
                        <Quote className="absolute top-8 left-8 w-12 h-12 text-[#B8975A]/20" />

                        <div className="relative z-10">
                            <p className="text-xl md:text-2xl text-[#2C3E2C] leading-relaxed mb-8 italic">
                                "{testimonials[activeIndex].quote}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                        {testimonials[activeIndex].author.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-[#2C3E2C]">{testimonials[activeIndex].author}</p>
                                    <p className="text-sm text-[#6B7B6B]">{testimonials[activeIndex].company}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`h-2 rounded-full transition-all ${index === activeIndex
                                        ? "bg-[#B8975A] w-12"
                                        : "bg-[#E5E3DB] w-2 hover:bg-[#D1D7CC]"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Grid of smaller testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
                    {testimonials.slice(0, 3).map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white/90 backdrop-blur-sm border border-[#E5E3DB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Quote className="w-8 h-8 text-[#B8975A]/20 mb-4" />
                            <p className="text-sm text-[#6B7B6B] mb-4 line-clamp-4">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {testimonial.author.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-[#2C3E2C] text-sm">{testimonial.author}</p>
                                    <p className="text-xs text-[#6B7B6B]">{testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
