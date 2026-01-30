"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Handshake } from "lucide-react";
import { useState } from "react";
import { submitCollaborationRequest } from "@/features/mls/actions/mls-actions";

interface CollaborationFormProps {
    propertyId: string;
}

export function CollaborationForm({ propertyId }: CollaborationFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append("propertyId", propertyId);

        await submitCollaborationRequest(formData);

        setLoading(false);
        setOpen(false);
        alert("Solicitud enviada. El asesor te contactará pronto.");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 gap-2">
                    <Handshake className="w-4 h-4" /> Solicitar Colaboración
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Solicitar Colaboración / Visita</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="flex flex-col gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tu Nombre</Label>
                        <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agency">Inmobiliaria / Independiente</Label>
                        <Input id="agency" name="agency" placeholder="Livoo Realty" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Tu WhatsApp</Label>
                        <Input id="phone" name="phone" placeholder="55 1234 5678" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea id="message" name="message" placeholder="Hola, me interesa llevar un cliente para esta propiedad..." required />
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg text-xs text-emerald-800 border border-emerald-100">
                        Al solicitar colaboración, aceptas respetar la comisión compartida publicada (50/50).
                    </div>

                    <Button type="submit" disabled={loading} className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
