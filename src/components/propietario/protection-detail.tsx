"use client";

import { motion } from "framer-motion";
import { Shield, UserCheck, FileSignature, ShieldCheck, Headphones, Key, Scale } from "lucide-react";

export function ProtectionDetail() {
    const benefits = [
        {
            icon: UserCheck,
            title: "Investigación de Inquilino",
            description: "Evaluamos antecedentes legales, capacidad de pago y referencias para asegurar al candidato ideal.",
            gradient: "from-[#2C3E2C] to-[#556B55]"
        },
        {
            icon: ShieldCheck,
            title: "Pago de Rentas Puntuales",
            description: "Si el inquilino no paga, nosotros intervenimos. Respaldo financiero durante la vigencia del contrato.",
            gradient: "from-[#556B55] to-[#7D8F77]"
        },
        {
            icon: Scale,
            title: "Asesoría Legal Integral",
            description: "Abogados expertos a tu disposición para cualquier controversia, hasta la recuperación del inmueble.",
            gradient: "from-[#7D8F77] to-[#A8B5A1]"
        },
        {
            icon: FileSignature,
            title: "Contratos Digitales",
            description: "Olvídate del papeleo. Firma electrónica avanzada con plena validez legal desde cualquier dispositivo.",
            gradient: "from-[#B8975A] to-[#C4A872]"
        },
        {
            icon: Headphones,
            title: "Atención Especializada",
            description: "Un equipo de asesores listo para resolver tus dudas y acompañarte en todo el proceso de arrendamiento.",
            gradient: "from-[#A38449] to-[#B8975A]"
        },
        {
            icon: Key,
            title: "Recuperación de Inmueble",
            description: "Gestión completa del proceso de desalojo y recuperación en caso de incumplimiento grave.",
            gradient: "from-[#C4A872] to-[#D4C19C]"
        }
    ];

    return (
        <section className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#2C3E2C] text-white font-semibold text-sm mb-6 shadow-md">
                            <Shield className="w-5 h-5" />
                            Servicio Principal
                        </div>
                        <h2 className="text-4xl font-bold text-[#2C3E2C] mb-4">
                            Protección de Renta
                        </h2>
                        <p className="text-lg text-[#6B7B6B] max-w-3xl mx-auto">
                            Más que una póliza jurídica: es tu escudo financiero y legal ante cualquier
                            imprevisto durante el arrendamiento. Te protegemos desde el primer día hasta
                            la recuperación total de tu propiedad.
                        </p>
                    </motion.div>

                    {/* Benefits Grid - 6 items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E3DB] hover:border-[#B8975A]">
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <benefit.icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-xl font-bold text-[#2C3E2C] mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-[#6B7B6B] leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
