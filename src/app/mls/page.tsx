import { PropertyCard } from "@/components/property-card";
import { getMlsProperties } from "@/services/property-service";
import { MlsFilterBar } from "@/features/mls/components/mls-filter-bar";
import MapLoader from "@/components/map-loader";

export default async function MlsPage() {
    // Fetch only properties with shared commission
    const properties = await getMlsProperties();

    return (
        <div className="flex flex-col min-h-screen pt-20">
            <MlsFilterBar />

            <div className="flex flex-1">
                {/* List View */}
                <div className="w-full md:w-1/2 lg:w-3/5 xl:w-[55%] p-4 md:p-6 overflow-y-auto h-[calc(100vh-130px)]">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-primary">Bolsa Inmobiliaria (MLS)</h1>
                        <span className="text-sm text-muted-foreground">{properties.length} Propiedades</span>
                    </div>

                    {properties.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No hay propiedades compartidas disponibles en este momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} isMls={true} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Map View */}
                <div className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-[45%] bg-surface relative h-[calc(100vh-130px)] sticky top-[130px]">
                    <MapLoader properties={properties} />
                </div>
            </div>
        </div>
    );
}
