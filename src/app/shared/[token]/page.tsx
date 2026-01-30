import { getPropertyById } from "@/services/property-service";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Ruler } from "lucide-react";
import { CommissionBadge } from "@/features/mls/components/commission-badge";
import { Metadata } from "next";
import { incrementMlsView } from "@/features/mls/actions/mls-actions";
import { CollaborationForm } from "@/features/mls/components/collaboration-form";

interface SharedPageProps {
    params: Promise<{
        token: string
    }>;
    searchParams: Promise<{
        modality?: 'whitelabel' | 'mls' | 'original';
        agent?: string; // Encoded agent data if needed
    }>;
}

export async function generateMetadata({ params, searchParams }: SharedPageProps): Promise<Metadata> {
    // Await params and searchParams before using them
    const { token } = await params;
    const propertyId = token; // Assuming token is ID for now
    const property = await getPropertyById(propertyId);

    if (!property) return {};

    return {
        title: `${property.title} | Nexus Real Estate`,
        description: property.description.substring(0, 160),
    };
}

export default async function SharedPropertyPage({ params, searchParams }: SharedPageProps) {
    // Await params and searchParams before using them
    const { token } = await params;
    const { modality = 'original' } = await searchParams;
    const propertyId = token; // MVP: Token is simply the Property ID

    const property = await getPropertyById(propertyId);

    if (!property) {
        return notFound();
    }

    // Increment view count (fire and forget)
    incrementMlsView(propertyId);

    // Agent override logic for White Label
    const displayAgent = modality === 'whitelabel'
        ? { name: "Tu Agente de Confianza", avatar: "", whatsapp: "525500000000", verified: true } // Mock override
        : property.agent;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header / Navbar would allow White Label customization here */}
            {modality === 'whitelabel' && (
                <div className="bg-white border-b py-4 shadow-sm">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <span className="font-bold text-xl text-emerald-800">{displayAgent.name}</span>
                        <Button size="sm">Contactar Agente</Button>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-xl overflow-hidden">
                    <div className="relative h-[400px]">
                        <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
                    </div>
                    <div className="hidden md:grid grid-cols-2 gap-2">
                        {property.images.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="relative h-full min-h-[190px]">
                                <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
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

                                {modality === 'mls' && (
                                    <CommissionBadge percentage={property.commission?.percentage} />
                                )}
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

                    {/* Sidebar / Contact Box */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 sticky top-4">
                            <div className="text-3xl font-bold text-emerald-800 mb-6">
                                ${property.price.toLocaleString()} {property.currency}
                            </div>

                            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-slate-900">{displayAgent.name}</p>
                                    <p className="text-xs text-slate-500">Agente Certificado</p>
                                </div>
                            </div>

                            {modality === 'mls' ? (
                                <CollaborationForm propertyId={property.id} />
                            ) : (
                                <Button className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700">
                                    Contactar por WhatsApp
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
