"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Calculator, Shield, ShieldCheck, Zap } from "lucide-react";

export function ProtectionCalculator() {
    const [rentAmount, setRentAmount] = useState<string>("15000");

    const calculatePrice = (rent: number, type: 'basica' | 'm3' | 'm12') => {
        if (type === 'basica') {
            if (rent <= 20000) {
                return Math.max(5000, rent * 0.25);
            }
            return rent * 0.25;
        }

        if (type === 'm3') {
            if (rent <= 17000) {
                return 5000;
            }
            return rent * 0.30;
        }

        if (type === 'm12') {
            if (rent <= 15000) {
                return 9000;
            }
            return rent * 0.60;
        }

        return 0;
    };

    const rent = parseFloat(rentAmount) || 0;
    const prices = {
        basica: calculatePrice(rent, 'basica'),
        m3: calculatePrice(rent, 'm3'),
        m12: calculatePrice(rent, 'm12')
    };

    const plans = [
        {
            id: 'basica',
            name: 'BÁSICA',
            icon: Shield,
            price: prices.basica,
            features: [
                'Investigación del Inquilino',
                'Contrato de Arrendamiento',
                'Firma Electrónica',
                'Asesoría Legal Telefónica'
            ],
            description: 'Lo esencial para rentar con tranquilidad',
            gradient: 'from-gray-400 to-gray-500'
        },
        {
            id: 'm3',
            name: 'M3',
            icon: ShieldCheck,
            price: prices.m3,
            features: [
                'Todo lo de Básica',
                'Cobranza Extrajudicial',
                'Proceso de Desalojo',
                'Renta garantizada hasta 3 meses',
                'Asesoría Legal Completa'
            ],
            description: 'Protección intermedia con respaldo',
            gradient: 'from-[#2C3E2C] to-[#3F5140]',
            popular: true
        },
        {
            id: 'm12',
            name: 'M12',
            icon: Zap,
            price: prices.m12,
            features: [
                'Todo lo de M3',
                'Renta garantizada hasta 12 meses',
                'Pago de servicios adeudados',
                'Cobertura de daños al inmueble',
                'Prioridad en atención'
            ],
            description: 'Máxima protección y tranquilidad',
            gradient: 'from-[#B8975A] to-[#C4A872]'
        }
    ];

    return (
        <section id="calculadora" className="py-20 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E3DB] shadow-lg max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2C3E2C] text-white font-semibold text-sm mb-6 shadow-md">
                        <Calculator className="w-5 h-5" />
                        Calculadora de Protección
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E2C] mb-4">
                        Calcula tu protección ideal
                    </h2>
                    <p className="text-lg text-[#6B7B6B] max-w-3xl mx-auto mb-8">
                        Ingresa el monto de renta mensual y descubre el costo de cada plan
                    </p>

                    {/* Rent Input */}
                    <div className="max-w-md mx-auto mb-12">
                        <label className="block text-sm font-semibold text-[#2C3E2C] mb-3 text-left">
                            Monto de renta mensual
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#B8975A]">$</span>
                            <Input
                                type="number"
                                value={rentAmount}
                                onChange={(e) => setRentAmount(e.target.value)}
                                placeholder="15000"
                                className="pl-10 h-16 text-2xl font-bold text-center bg-white border-2 border-[#E5E3DB] focus:border-[#B8975A]"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Plans Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <div className="bg-[#B8975A] text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                                        Más Popular
                                    </div>
                                </div>
                            )}

                            <div className={`
                relative overflow-hidden rounded-3xl p-8 h-full flex flex-col
${plan.popular ? 'bg-[#2C3E2C] text-white shadow-2xl scale-105' : 'bg-white/95 backdrop-blur-sm border border-[#E5E3DB] shadow-lg'}
                                transition-all duration-300 hover:shadow-xl
              `}>
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 mx-auto`}>
                                    <plan.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Name */}
                                <h3 className={`text-2xl font-bold text-center mb-2 ${plan.popular ? 'text-[#B8975A]' : 'text-[#2C3E2C]'}`}>
                                    {plan.name}
                                </h3>

                                {/* Description */}
                                <p className={`text-sm text-center mb-6 ${plan.popular ? 'text-gray-300' : 'text-[#6B7B6B]'}`}>
                                    {plan.description}
                                </p>

                                {/* Price */}
                                <div className="text-center mb-8 pb-6 border-b border-white/10">
                                    <div className={`text-5xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-[#2C3E2C]'}`}>
                                        ${plan.price.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                    </div>
                                    <div className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-[#6B7B6B]'}`}>
                                        Costo anual + IVA
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? 'bg-[#B8975A]' : 'bg-[#E5E3DB]'
                                                }`}>
                                                <span className={plan.popular ? 'text-white text-xs' : 'text-[#2C3E2C] text-xs'}>✓</span>
                                            </div>
                                            <span className={plan.popular ? 'text-gray-200' : 'text-[#2C3E2C]'}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${plan.popular
                                        ? 'bg-[#B8975A] hover:bg-[#A38449] text-white'
                                        : 'bg-[#2C3E2C] hover:bg-[#1E2B1E] text-white'
                                    }`}>
                                    Contratar {plan.name}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Note */}
                <p className="text-center text-sm text-[#6B7B6B] mt-8 max-w-3xl mx-auto">
                    * Los precios se calculan con base en el monto de renta. Cada plan tiene costos mínimos y porcentajes variables.
                    Consulta términos y condiciones completos.
                </p>
            </div>
        </section>
    );
}
