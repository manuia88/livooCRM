import { getPropertyById } from "@/services/property-service";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Ruler, Mail, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface PrintPageProps {
    params: Promise<{
        id: string
    }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
    // Await params inside the component
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        return notFound();
    }

    const currentUrl = `https://nexus-os.com/propiedades/${property.id}`; // In real app, use env var

    return (
        <div className="bg-white text-black min-h-screen p-8 max-w-[210mm] mx-auto print:max-w-none print:p-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="text-2xl font-bold tracking-wider text-emerald-900 border-2 border-emerald-900 px-3 py-1">
                    NEXUS ESTATES
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>Ficha Técnica</p>
                    <p>{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Main Image */}
            <div className="relative h-[300px] w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
                <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Content */}
                <div className="col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.location.colonia}, {property.location.city}
                        </div>
                        <div className="text-3xl font-bold text-emerald-800">
                            ${property.price.toLocaleString()} {property.currency}
                        </div>
                    </div>

                    <div className="flex gap-6 py-4 border-y border-gray-100">
                        <div className="flex items-center gap-2">
                            <BedDouble className="w-5 h-5 text-emerald-600" />
                            <span>{property.features.bedrooms} Recámaras</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bath className="w-5 h-5 text-emerald-600" />
                            <span>{property.features.bathrooms} Baños</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-emerald-600" />
                            <span>{property.features.area} m²</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-2">Descripción</h2>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line text-justify">
                            {property.description}
                        </p>
                    </div>

                    {/* Secondary Images - just 2 for print */}
                    <div className="grid grid-cols-2 gap-4">
                        {property.images.slice(1, 3).map((img, idx) => (
                            <div key={idx} className="relative h-40 rounded bg-gray-100 overflow-hidden">
                                <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Agent Info */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="font-bold mb-4 text-emerald-900 border-b pb-2">CONTACTO</h3>

                        <div className="flex items-center gap-3 mb-4">
                            {property.agent.avatar && (
                                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                    <Image src={property.agent.avatar} alt={property.agent.name} fill />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-sm">{property.agent.name}</p>
                                <p className="text-xs text-gray-500">Agente Certificado</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-600" />
                                <span>{property.agent.whatsapp}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-emerald-600" />
                                <span>contacto@nexus.com</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="text-center">
                        <div className="bg-white p-2 inline-block border rounded">
                            <QRCodeSVG value={currentUrl} size={120} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Escanea para ver más fotos</p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
                Generado por Nexus OS - {new Date().getFullYear()}
            </div>
        </div>
    );
}
