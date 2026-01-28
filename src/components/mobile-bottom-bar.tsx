"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

export function MobileBottomBar({ whatsapp, phone }: { whatsapp: string; phone?: string }) {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border p-4 z-40 lg:hidden flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] pb- safe-area-inset-bottom">
            <Button
                className="flex-1 font-semibold text-base"
                variant="gold"
                onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank')}
            >
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
            {phone && (
                <Button
                    className="flex-1 font-semibold text-base"
                    variant="outline"
                    onClick={() => window.location.href = `tel:${phone}`}
                >
                    <Phone className="w-5 h-5 mr-2" /> Llamar
                </Button>
            )}
        </div>
    );
}
