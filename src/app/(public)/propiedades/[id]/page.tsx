import { getPropertyById } from "@/services/property-service";
import { notFound } from "next/navigation";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Car, Ruler, CheckCircle2, Share2, Heart, Phone, MessageCircle } from "@/components/icons";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import MapLoader from "@/components/map-loader";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PropertyIdPage({ params }: PageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        notFound();
    }

    const { title, description, price, currency, location, features, images, agent, listingType } = property;

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8F7F4]/50 to-white pb-20">
            {/* Header / Gallery - Estilo Apple con colores Livoo */}
            <div className="container mx-auto px-4 pt-24 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden relative group shadow-2xl shadow-[#2C3E2C]/10 border border-[#E5E3DB]">
                    {/* Main Image */}
                    <div className="md:col-span-2 md:row-span-2 relative">
                        <OptimizedImage src={images[0]} alt={title} fill className="object-cover" priority />
                    </div>
                    {/* Secondary Images - only show if exist, otherwise fallback or slice */}
                    {images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="relative hidden md:block">
                            <OptimizedImage src={img} alt={`${title} ${idx}`} fill className="object-cover" />
                        </div>
                    ))}

                    {/* Show All Photos Button */}
                    <div className="absolute bottom-4 right-4">
                        <Button variant="secondary" size="sm" className="rounded-xl shadow-2xl backdrop-blur-xl bg-white/95 hover:bg-white border border-[#E5E3DB] text-[#2C3E2C]">
                            Ver todas las fotos
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header Info - Estilo Apple */}
                    <div className="border-b border-[#E5E3DB] pb-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="bg-[#B8975A]/15 text-[#2C3E2C] text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider mb-2 inline-block">
                                    {listingType === 'buy' ? 'Venta' : 'En Renta'}
                                </span>
                                <h1 className="text-3xl md:text-3xl font-bold text-foreground mb-1">{title}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1 text-accent" />
                                    <span>{location.address}, {location.colonia}, {location.city}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Heart className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 md:gap-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-2xl border border-[#E5E3DB] shadow-lg">
                                <Ruler className="w-5 h-5 text-[#6B7B6B]" />
                                <span className="font-semibold">{features.area} m²</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-2xl border border-[#E5E3DB] shadow-lg">
                                <BedDouble className="w-5 h-5 text-[#6B7B6B]" />
                                <span className="font-semibold">{features.bedrooms} Recámaras</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-2xl border border-[#E5E3DB] shadow-lg">
                                <Bath className="w-5 h-5 text-[#6B7B6B]" />
                                <span className="font-semibold">{features.bathrooms} Baños</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-2xl border border-[#E5E3DB] shadow-lg">
                                <Car className="w-5 h-5 text-[#6B7B6B]" />
                                <span className="font-semibold">{features.parking} Estac.</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Descripción</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {description}
                        </p>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Amenidades y Características</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                            {features.hasPool && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Alberca
                                </div>
                            )}
                            {features.hasGym && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Gimnasio
                                </div>
                            )}
                            {features.hasSecurity && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Seguridad 24/7
                                </div>
                            )}
                            {features.petFriendly && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Pet Friendly
                                </div>
                            )}
                            {features.furnished && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Amueblado
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Section - Estilo Apple */}
                    <div className="h-[300px] w-full bg-[#F8F7F4] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E3DB] shadow-2xl relative z-0">
                        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg border border-[#E5E3DB]/50 flex items-center gap-1 text-[#2C3E2C]">
                            <MapPin className="w-3 h-3 text-[#B8975A]" />
                            {location.colonia}, {location.city}
                        </div>
                        <MapLoader properties={[property]} single={true} />
                    </div>
                </div>

                {/* Sticky Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 bg-white border border-border rounded-xl p-6 shadow-xl shadow-slate-200/50">
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Precio de {listingType}</p>
                            <p className="text-3xl font-bold text-primary">{formatPrice(price)}</p>
                        </div>

                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface relative">
                                <OptimizedImage src={agent.avatar} alt={agent.name} fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{agent.name}</p>
                                {agent.verified && (
                                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Verificado
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full h-12 text-base font-semibold" variant="gold">
                                <MessageCircle className="w-5 h-5 mr-2" /> Contactar por WhatsApp
                            </Button>
                            <Button variant="outline" className="w-full h-12 text-base font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary">
                                <Phone className="w-5 h-5 mr-2" /> Agendar Visita
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Respuesta promedio: 5 minutos
                        </p>
                    </div>
                </div>
            </div>

            <MobileBottomBar whatsapp={agent.whatsapp} phone="5512345678" />
        </div>
    );
}
