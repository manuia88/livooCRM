'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PROPERTY_AMENITIES, AMENITY_LABELS } from '@/types/property-extended';
import type { PropertyFormStep4 } from '@/types/property-extended';
import { Check } from 'lucide-react';

interface Step4AmenitiesProps {
    data: Partial<PropertyFormStep4>;
    onChange: (data: Partial<PropertyFormStep4>) => void;
}

export function Step4Amenities({ data, onChange }: Step4AmenitiesProps) {
    const selectedAmenities = new Set(data.amenities || []);

    const toggleAmenity = (amenity: string, checked: boolean) => {
        const next = new Set(selectedAmenities);
        if (checked) {
            next.add(amenity);
        } else {
            next.delete(amenity);
        }
        onChange({ ...data, amenities: Array.from(next) });
    };

    // Group amenities for better display (optional visual grouping)
    // Or just display them in a grid. Let's do a grid as defined.

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Amenidades y Servicios</h2>
                <p className="text-muted-foreground">
                    Selecciona todas las amenidades que ofrezca la propiedad o el desarrollo.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {PROPERTY_AMENITIES.map((amenityKey) => {
                    const isSelected = selectedAmenities.has(amenityKey);
                    return (
                        <div
                            key={amenityKey}
                            className={`
                 relative flex items-center space-x-3 
                 p-4 rounded-lg border cursor-pointer
                 transition-all duration-200
                 ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'}
               `}
                            onClick={() => toggleAmenity(amenityKey, !isSelected)}
                        >
                            <Checkbox
                                id={amenityKey}
                                checked={isSelected}
                                onCheckedChange={(checked) => toggleAmenity(amenityKey, checked as boolean)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label
                                htmlFor={amenityKey}
                                className="cursor-pointer font-medium flex-1 text-sm select-none"
                            >
                                {AMENITY_LABELS[amenityKey]}
                            </Label>

                            {isSelected && (
                                <Check className="h-4 w-4 text-primary absolute top-2 right-2 opacity-50" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3 mt-8">
                <span className="text-2xl">⚡</span>
                <div>
                    <h4 className="font-semibold text-blue-900">Potencia tu Health Score</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        Agregar al menos 5 amenidades suma 5 puntos a tu calificación. Actualmente tienes seleccionadas: <strong>{selectedAmenities.size}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
