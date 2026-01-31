'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { PropertyFormStep2 } from '@/types/property-extended';

interface Step2LocationProps {
    data: Partial<PropertyFormStep2>;
    onChange: (data: Partial<PropertyFormStep2>) => void;
}

export function Step2Location({ data, onChange }: Step2LocationProps) {
    const updateAddress = (field: string, value: string) => {
        onChange({
            ...data,
            address: {
                ...data.address,
                [field]: value
            }
        });
    };

    const toggleExactLocation = (checked: boolean) => {
        onChange({ ...data, show_exact_location: checked });
    };

    // Mock function to simulate getting coordinates from address
    const handleGeocode = () => {
        // In a real implementation, this would call Google Maps Geocoding API
        // For now, we'll just simulate setting coordinates to enable health score points
        const mockLat = 19.4326;
        const mockLng = -99.1332;

        onChange({
            ...data,
            coordinates: {
                lat: mockLat,
                lng: mockLng
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Ubicación</h2>
                <p className="text-muted-foreground">
                    Indica dónde se encuentra la propiedad. La ubicación exacta es clave para el Health Score.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Calle *</Label>
                        <Input
                            id="street"
                            value={data.address?.street || ''}
                            onChange={(e) => updateAddress('street', e.target.value)}
                            placeholder="Av. Principal"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ext_num">Num. Exterior *</Label>
                            <Input
                                id="ext_num"
                                value={data.address?.exterior_number || ''}
                                onChange={(e) => updateAddress('exterior_number', e.target.value)}
                                placeholder="123"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="int_num">Num. Interior</Label>
                            <Input
                                id="int_num"
                                value={data.address?.interior_number || ''}
                                onChange={(e) => updateAddress('interior_number', e.target.value)}
                                placeholder="401"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="neighborhood">Colonia / Barrio *</Label>
                        <Input
                            id="neighborhood"
                            value={data.address?.neighborhood || ''}
                            onChange={(e) => updateAddress('neighborhood', e.target.value)}
                            placeholder="Polanco"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Código Postal *</Label>
                            <Input
                                id="postal_code"
                                value={data.address?.postal_code || ''}
                                onChange={(e) => updateAddress('postal_code', e.target.value)}
                                placeholder="11550"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad/Municipio *</Label>
                            <Input
                                id="city"
                                value={data.address?.city || ''}
                                onChange={(e) => updateAddress('city', e.target.value)}
                                placeholder="Ciudad de México"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="state">Estado *</Label>
                            <Input
                                id="state"
                                value={data.address?.state || ''}
                                onChange={(e) => updateAddress('state', e.target.value)}
                                placeholder="CDMX"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">País</Label>
                            <Input
                                id="country"
                                value={data.address?.country || 'México'}
                                onChange={(e) => updateAddress('country', e.target.value)}
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="space-y-4">
                    <Label>Ubicación en el Mapa</Label>
                    <div className="border rounded-lg h-[300px] bg-muted/20 relative overflow-hidden flex items-center justify-center flex-col gap-4">

                        {data.coordinates ? (
                            <div className="absolute inset-0 bg-green-50 flex items-center justify-center flex-col text-green-700">
                                <MapPin className="h-10 w-10 mb-2" />
                                <p className="font-semibold">Ubicación Confirmada</p>
                                <p className="text-xs">Lat: {data.coordinates.lat}, Lng: {data.coordinates.lng}</p>
                            </div>
                        ) : (
                            <>
                                <MapPin className="h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground text-center px-8">
                                    Ingresa la dirección para ubicar en el mapa o haz clic para fijar manualmente.
                                </p>
                            </>
                        )}

                        {!data.coordinates && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleGeocode}
                                className="z-10"
                            >
                                Ubicar en Mapa (Simulado)
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base">Mostrar ubicación exacta</Label>
                            <p className="text-sm text-muted-foreground">
                                Si desactivas, solo se mostrará la zona aproximada en portales públicos.
                            </p>
                        </div>
                        <Switch
                            checked={data.show_exact_location}
                            onCheckedChange={toggleExactLocation}
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 flex items-start gap-2">
                        <span className="text-lg leading-none">💡</span>
                        <p>
                            <strong>Tip de Health Score:</strong> Confirmar la ubicación exacta mediante GPS otorga 10 puntos al score de la propiedad.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
