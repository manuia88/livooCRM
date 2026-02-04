"use client";

import { motion } from "framer-motion";
import { FileSignature, Smartphone, Shield, Clock } from "lucide-react";

export function ContractsDetail() {
    const benefits = [
        {
            icon: FileSignature,
            title: "Contratos personalizados",
            description: "Redactados por abogados expertos en arrendamiento con cláusulas que protegen tu patrimonio."
        },
        {
            icon: Smartphone,
            title: "Firma electrónica avanzada",
            description: "Firma legalmente válida desde cualquier dispositivo. Sin necesidad de reuniones presenciales."
        },
        {
            icon: Shield,
            title: "100% validez legal",
            description: "Cumplimos con toda la normatividad vigente. Tu contrato tiene plena validez ante cualquier instancia."
        },
        {
            icon: Clock,
            title: "En menos de 24 horas",
            description: "Una vez aprobado el inquilino, generamos y firmamos el contrato el mismo día."
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
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#B8975A] text-white font-semibold text-sm mb-6 shadow-md">
                            <FileSignature className="w-5 h-5" />
                            Digitalización Total
                        </div>
                        <h2 className="text-4xl font-bold text-[#2C3E2C] mb-4">
                            Elaboración y Firma de Contratos
                        </h2>
                        <p className="text-lg text-[#6B7B6B] max-w-3xl mx-auto">
                            Olvídate del papeleo. Generamos contratos de arrendamiento digitales con
                            validez legal total, que puedes firmar desde tu celular en minutos.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E3DB]"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#F8F7F4] flex items-center justify-center mx-auto mb-4 shadow-md">
                                    <benefit.icon className="w-7 h-7 text-[#2C3E2C]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#2C3E2C] mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm text-[#6B7B6B] leading-relaxed">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Process Flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#E5E3DB] shadow-xl"
                    >
                        <h3 className="text-2xl font-bold text-[#2C3E2C] mb-8 text-center">
                            Proceso de firma digital
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { step: "1", title: "Generamos el contrato", desc: "Con todos los datos del inmueble y partes" },
                                { step: "2", title: "Enviamos por email/SMS", desc: "Recibes un link seguro para firmar" },
                                { step: "3", title: "Firmas en segundos", desc: "Validamos identidad y listo, contrato firmado" }
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#B8975A] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                                        {item.step}
                                    </div>
                                    <h4 className="font-bold text-[#2C3E2C] mb-2">{item.title}</h4>
                                    <p className="text-sm text-[#6B7B6B]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
