import { getProperties } from "@/services/property-service";
import { Home } from "lucide-react";
import { PropertiesListing } from "@/components/properties-listing";

function getHeroTitle(type?: string, category?: string) {
    const isRent = type === "rent";
    const mode = isRent ? "renta" : type === "buy" ? "venta" : null;
    if (category === "departamento" && mode) return `Departamentos en ${mode}`;
    if (category === "casa" && mode) return `Casas en ${mode}`;
    if (mode) return `Propiedades en ${mode}`;
    return "Propiedades";
}

function getHeroSubtitle(type?: string, category?: string) {
    const isRent = type === "rent";
    if (category === "departamento") return isRent ? "Encuentra tu próximo departamento en renta." : "Departamentos en venta en las mejores zonas.";
    if (category === "casa") return isRent ? "Casas en renta con las mejores condiciones." : "Casas en venta para ti y tu familia.";
    return "Explora nuestro catálogo de inmuebles disponibles.";
}

function getListingLabel(type?: string) {
    if (type === "rent") return "en renta";
    if (type === "buy") return "en venta";
    return "en venta y renta";
}

function getLocationLabel(properties: { location?: { city?: string } }[]) {
    const city = properties[0]?.location?.city;
    if (city) return city;
    return "CDMX";
}

export default async function PropertiesPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; category?: string }>;
}) {
    const params = await searchParams;
    const type = params?.type;
    const category = params?.category;
    const properties = await getProperties();

    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Header compacto */}
            <div className="bg-gradient-to-br from-[#FAF8F3] to-[#F2F0E9] border-b border-[#E5E3DB] px-4 py-4 sm:py-5">
                <div className="container mx-auto flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#2C3E2C] to-[#3F5140] rounded-xl shadow-md flex-shrink-0">
                        <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2C3E2C]">
                            {getHeroTitle(type, category)}
                        </h1>
                        <p className="text-sm text-[#6B7B6B] mt-0.5">
                            {getHeroSubtitle(type, category)}
                        </p>
                    </div>
                </div>
            </div>

            <PropertiesListing
                properties={properties}
                listingLabel={getListingLabel(type)}
                locationLabel={getLocationLabel(properties)}
            />
        </div>
    );
}
