"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { useState } from "react";
import { createSearchAlert } from "@/features/mls/actions/alert-actions";

export function AlertDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // Mock filters for MVP - in real app would get from URL or context
        formData.append("filters", JSON.stringify({ priceMin: 100000 }));

        const res = await createSearchAlert(formData);
        setLoading(false);

        if (res.success) {
            setOpen(false);
            // Show toast success
            alert("Alerta creada exitosamente");
        } else {
            alert("Error al crear alerta: " + res.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-border gap-2">
                    <Bell className="w-4 h-4" /> Crear Alerta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Alerta de Búsqueda</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="flex flex-col gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la alerta</Label>
                        <Input id="name" name="name" placeholder="Ej. Departamentos en Polanco" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frecuencia</Label>
                        <Select name="frequency" defaultValue="daily">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Diaria</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="instant">Inmediata</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                        Se guardarán los filtros actuales de tu búsqueda.
                    </div>

                    <Button type="submit" disabled={loading} className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                        {loading ? "Guardando..." : "Crear Alerta"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
