import { getPropertyById } from "@/services/property-service";
import { notFound } from "next/navigation";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { MapPin, BedDouble, Bath, Ruler } from "@/components/icons";
import { CommissionBadge } from "@/features/mls/components/commission-badge";
import { CollaborationForm } from "@/features/mls/components/collaboration-form";
import { incrementMlsView } from "@/features/mls/actions/mls-actions";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    // Await params before usage
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property) return {};
    return { title: `${property.title} | MLS Nexus`, description: property.description.substring(0, 160) };
}

export default async function MlsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params before usage
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property || !property.commission?.shared) {
        return notFound();
    }

    // Track view
    incrementMlsView(id);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-xl overflow-hidden">
                    <div className="relative h-[400px]">
                        <OptimizedImage src={property.images[0]} alt={property.title} fill className="object-cover" />
                    </div>
                    <div className="hidden md:grid grid-cols-2 gap-2">
                        {property.images.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="relative h-full min-h-[190px]">
                                <OptimizedImage src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                                    <div className="flex items-center text-slate-500 mb-4">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {property.location.colonia}, {property.location.city}
                                    </div>
                                </div>
                                <CommissionBadge percentage={property.commission.percentage} />
                            </div>

                            <div className="flex flex-wrap gap-6 py-6 border-y border-slate-100">
                                <div className="flex items-center gap-2">
                                    <BedDouble className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold">{property.features.bedrooms} Recámaras</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bath className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold">{property.features.bathrooms} Baños</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold">{property.features.area} m²</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold mb-4">Descripción</h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 sticky top-24">
                            <div className="text-3xl font-bold text-emerald-800 mb-6">
                                ${property.price.toLocaleString()} {property.currency}
                            </div>

                            <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 overflow-hidden relative border border-emerald-200">
                                    {property.agent.avatar && <OptimizedImage src={property.agent.avatar} alt={property.agent.name} fill />}
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-900">{property.agent.name}</p>
                                    <p className="text-xs text-emerald-600">Comisión Compartida: {property.commission.percentage}%</p>
                                </div>
                            </div>

                            <CollaborationForm propertyId={property.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
