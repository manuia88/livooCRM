"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { AlertDialog } from "@/features/mls/components/alert-dialog";

export function MlsFilterBar() {
    return (
        <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <Button variant="outline" size="sm" className="rounded-full border-border">
                        <Filter className="w-4 h-4 mr-2" /> Filtros
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-border">Precio</Button>
                    <Button variant="outline" size="sm" className="rounded-full border-border">Tipo</Button>
                    <Button variant="outline" size="sm" className="rounded-full border-border">Comisión %</Button>
                    <Button variant="outline" size="sm" className="rounded-full border-border text-emerald-600 border-emerald-200 bg-emerald-50">
                        Solo Compartidas
                    </Button>

                    <div className="ml-2 pl-2 border-l border-border">
                        <AlertDialog />
                    </div>
                </div>
            </div>
        </div>
    );
}
