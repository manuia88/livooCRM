import { PropertyCard } from "@/components/property-card";
import { getProperties } from "@/services/property-service";
import { Button } from "@/components/ui/button";
import { Filter, Map as MapIcon, List } from "lucide-react";
import MapLoader from "@/components/map-loader";

export default async function PropertiesPage() {
    const properties = await getProperties();

    return (
        <div className="flex flex-col min-h-screen pt-20"> {/* pt-20 for fixed header space if needed later */}

            {/* Filters Bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        <Button variant="outline" size="sm" className="rounded-full border-border">
                            <Filter className="w-4 h-4 mr-2" /> Filtros
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full border-border">Precio</Button>
                        <Button variant="outline" size="sm" className="rounded-full border-border">Tipo de Propiedad</Button>
                        <Button variant="outline" size="sm" className="rounded-full border-border">Dormitorios</Button>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">{properties.length} Resultados</span>
                        <div className="bg-surface p-1 rounded-md flex">
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm">
                                <List className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MapIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1">
                {/* List View (Left Side on Desktop) */}
                <div className="w-full md:w-1/2 lg:w-3/5 xl:w-[55%] p-4 md:p-6 overflow-y-auto h-[calc(100vh-130px)]">
                    <h1 className="text-2xl font-bold mb-6 text-primary">Propiedades en Renta y Venta</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>

                {/* Map View (Right Side - Sticky) */}
                <div className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-[45%] bg-surface relative h-[calc(100vh-130px)] sticky top-[130px]">
                    <MapLoader properties={properties} />
                </div>
            </div>
        </div>
    );
}
