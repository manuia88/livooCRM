'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BedDouble, Bath, CarFront, Ruler, Building, Calendar } from 'lucide-react';
import type { PropertyFormStep3 } from '@/types/property-extended';

interface Step3FeaturesProps {
    data: Partial<PropertyFormStep3>;
    onChange: (data: Partial<PropertyFormStep3>) => void;
}

export function Step3Features({ data, onChange }: Step3FeaturesProps) {
    const updateField = (field: keyof PropertyFormStep3, value: string | number) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Características</h2>
                <p className="text-muted-foreground">
                    Define los espacios y dimensiones de la propiedad.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Habitaciones */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        Recámaras *
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="3"
                        value={data.bedrooms || ''}
                        onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Baños Completos */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Baños Completos *
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="2"
                        value={data.bathrooms || ''}
                        onChange={(e) => updateField('bathrooms', parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* Medios Baños */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <span className="text-sm font-bold">½</span>
                        Medios Baños
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="1"
                        value={data.half_bathrooms || ''}
                        onChange={(e) => updateField('half_bathrooms', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Estacionamientos */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <CarFront className="h-4 w-4" />
                        Estacionamientos
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="2"
                        value={data.parking_spaces || ''}
                        onChange={(e) => updateField('parking_spaces', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* M2 Construcción */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Construcción (m²) *
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="150"
                        value={data.construction_m2 || ''}
                        onChange={(e) => updateField('construction_m2', parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* M2 Terreno */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Terreno (m²) *
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="200"
                        value={data.land_m2 || ''}
                        onChange={(e) => updateField('land_m2', parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* Niveles */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Niveles
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        placeholder="2"
                        value={data.floors || ''}
                        onChange={(e) => updateField('floors', parseInt(e.target.value) || 1)}
                    />
                </div>

                {/* Antigüedad */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Año de Construcción
                    </Label>
                    <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        placeholder="2010"
                        value={data.year_built || ''}
                        onChange={(e) => updateField('year_built', parseInt(e.target.value) || 2000)}
                    />
                </div>

                {/* Estado de Conservación */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        Estado de Conservación
                    </Label>
                    <Select
                        value={data.condition || 'good'}
                        onValueChange={(val) => updateField('condition', val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">Nuevo (Estrenar)</SelectItem>
                            <SelectItem value="excellent">Excelente</SelectItem>
                            <SelectItem value="good">Bueno</SelectItem>
                            <SelectItem value="needs_repair">Para Remodelar</SelectItem>
                            <SelectItem value="under_construction">En Construcción (Preventa)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
