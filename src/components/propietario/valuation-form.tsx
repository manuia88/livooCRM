"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, MapPin, Home, Ruler } from "lucide-react";

interface ValuationFormProps {
    type: "venta" | "renta";
}

export function ValuationForm({ type }: ValuationFormProps) {
    const [address, setAddress] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [size, setSize] = useState("");

    return (
        <section className="py-16 bg-[#FAF8F3]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-[#E5E3DB] p-8 md:p-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#B8975A] to-[#C4A872] mb-4">
                                <Calculator className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E2C] mb-2">
                                {type === "venta" ? "Valuación Instantánea y Gratuita" : "¿Cuánto puedes ganar al mes?"}
                            </h2>
                            <p className="text-lg text-[#6B7B6B]">
                                {type === "venta"
                                    ? "Descubre cuánto vale tu propiedad en minutos"
                                    : "Calcula la renta óptima de tu propiedad"}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#2C3E2C] mb-2">
                                    Dirección
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7B6B]" />
                                    <Input
                                        placeholder="Ej: Av. Reforma 123, Polanco"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-[#B8975A]"
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2C3E2C] mb-2">
                                    Tipo
                                </label>
                                <Select value={propertyType} onValueChange={setPropertyType}>
                                    <SelectTrigger className="h-12 border-2 border-gray-200">
                                        <Home className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="departamento">Departamento</SelectItem>
                                        <SelectItem value="casa">Casa</SelectItem>
                                        <SelectItem value="penthouse">Penthouse</SelectItem>
                                        <SelectItem value="terreno">Terreno</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2C3E2C] mb-2">
                                    m²
                                </label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7B6B]" />
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-[#B8975A]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            {type === "venta" ? "Valuar mi propiedad →" : "Calcular renta estimada →"}
                        </Button>

                        {/* Info Text */}
                        <p className="text-center text-sm text-[#6B7B6B] mt-4">
                            {type === "venta"
                                ? "✓ Sin compromiso • Valuación profesional • 100% gratuito"
                                : "✓ Calculo en segundos • Sin compromiso • Gratis"}
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
