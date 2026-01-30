"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, User, Users, Link as LinkIcon, Download, Smartphone } from "lucide-react";
import { useState } from "react";
import { Property } from "@/types/property";

interface SharingModalProps {
    property: Property;
}

export function SharingModal({ property }: SharingModalProps) {
    const [modality, setModality] = useState<'whitelabel' | 'mls' | 'original'>('whitelabel');

    const handleShare = (channel: string) => {
        // Mock sharing logic
        console.log(`Sharing ${property.title} via ${channel} using modality ${modality}`);
        // In real impl, generate link/token here
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-emerald-600 hover:border-emerald-200">
                    <Share2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartir Propiedad</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {/* Modality Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant={modality === 'whitelabel' ? 'default' : 'outline'}
                            className={`flex flex-col h-auto py-3 gap-2 ${modality === 'whitelabel' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => setModality('whitelabel')}
                        >
                            <User className="w-5 h-5" />
                            <span className="text-xs">Mis Datos</span>
                        </Button>
                        <Button
                            variant={modality === 'mls' ? 'default' : 'outline'}
                            className={`flex flex-col h-auto py-3 gap-2 ${modality === 'mls' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => setModality('mls')}
                        >
                            <Users className="w-5 h-5" />
                            <span className="text-xs">Colegas</span>
                        </Button>
                        <Button
                            variant={modality === 'original' ? 'default' : 'outline'}
                            className={`flex flex-col h-auto py-3 gap-2 ${modality === 'original' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => setModality('original')}
                        >
                            <LinkIcon className="w-5 h-5" />
                            <span className="text-xs">Original</span>
                        </Button>
                    </div>

                    {/* Description of current modality */}
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                        {modality === 'whitelabel' && "Se comparte con TU nombre y teléfono. El cliente te contactará a ti."}
                        {modality === 'mls' && "Muestra la comisión compartida (50/50). Ideal para grupos de asesores."}
                        {modality === 'original' && "Link directo a la ficha original sin modificaciones."}
                    </div>

                    {/* Channels */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button variant="outline" className="gap-2" onClick={() => handleShare('whatsapp')}>
                            <Smartphone className="w-4 h-4 text-green-600" /> WhatsApp
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => handleShare('copy')}>
                            <LinkIcon className="w-4 h-4" /> Copiar Link
                        </Button>
                        <Button variant="outline" className="gap-2 col-span-2" onClick={() => window.open(`/propiedades/${property.id}/print`, '_blank')}>
                            <Download className="w-4 h-4" /> Descargar PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
