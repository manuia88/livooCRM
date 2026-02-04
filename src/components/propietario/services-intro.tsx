"use client";

import { motion } from "framer-motion";
import { Shield, Users, FileCheck } from "lucide-react";

export function ServicesIntro() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center mb-16 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg"
                >
                    <span className="text-[#B8975A] font-semibold tracking-wider uppercase text-sm block mb-4">
                        Servicios para Propietarios
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-6">
                        Te ayudamos a rentar tu inmueble de forma segura, rápida y con respaldo legal
                    </h2>
                    <p className="text-xl text-[#6B7B6B] leading-relaxed">
                        En Livoo somos expertos en ofrecer servicios para propietarios que buscan tranquilidad
                        y protección al rentar su propiedad. Nuestro equipo jurídico y operativo te acompaña en
                        cada etapa del proceso: desde aprobar al inquilino hasta firmar contrato y de ser necesario
                        la recuperación del inmueble.
                    </p>
                </motion.div>

                {/* Quick Service Icons - Now Clickable (3 services only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[
                        { id: "proteccion", icon: Shield, label: "Protección de Renta", color: "from-[#2C3E2C] to-[#3F5140]" },
                        { id: "investigacion", icon: Users, label: "Investigación de Inquilinos", color: "from-[#556B55] to-[#7D8F77]" },
                        { id: "contratos", icon: FileCheck, label: "Elaboración y Firma de Contratos", color: "from-[#B8975A] to-[#C4A872]" }
                    ].map((service, index) => (
                        <motion.button
                            key={service.label}
                            onClick={() => scrollToSection(service.id)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl hover:border-[#B8975A] transition-all duration-300 border border-[#E5E3DB] cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mx-auto mb-4`}>
                                <service.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-[#2C3E2C]">{service.label}</h3>
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
}
