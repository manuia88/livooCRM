import { Badge } from "@/components/ui/badge";
import { Handshake } from "lucide-react";

interface CommissionBadgeProps {
    percentage?: number;
    showLabel?: boolean;
}

export function CommissionBadge({ percentage, showLabel = true }: CommissionBadgeProps) {
    if (!percentage) return null;

    return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 gap-1">
            <Handshake className="w-3 h-3" />
            <span className="font-semibold">{percentage}%</span>
            {showLabel && <span className="hidden sm:inline">Comisión</span>}
        </Badge>
    );
}
