'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import type { PropertyFormStep1 } from '@/types/property-extended';

interface Step1BasicInfoProps {
    data: Partial<PropertyFormStep1>;
    onChange: (data: Partial<PropertyFormStep1>) => void;
}

const PROPERTY_TYPES = [
    { value: 'house', label: 'Casa' },
    { value: 'apartment', label: 'Departamento' },
    { value: 'condo', label: 'Condominio' },
    { value: 'townhouse', label: 'Casa en condominio' },
    { value: 'land', label: 'Terreno' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'office', label: 'Oficina' },
    { value: 'warehouse', label: 'Bodega' },
    { value: 'building', label: 'Edificio' },
    { value: 'farm', label: 'Rancho' },
];

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
    const updateField = (field: keyof PropertyFormStep1, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Información Básica</h2>
                <p className="text-muted-foreground">
                    Comienza con los datos principales de la propiedad
                </p>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
                <Label htmlFor="property_type" className="text-base font-medium">
                    Tipo de Propiedad *
                </Label>
                <Select
                    value={data.property_type}
                    onValueChange={(value) => updateField('property_type', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Operation Type */}
            <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de Operación *</Label>
                <RadioGroup
                    value={data.operation_type}
                    onValueChange={(value) => updateField('operation_type', value)}
                    className="flex gap-4"
                >
                    <Card className="flex-1 p-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sale" id="sale" />
                            <Label htmlFor="sale" className="cursor-pointer flex-1">
                                <div className="font-semibold">Venta</div>
                                <div className="text-sm text-muted-foreground">Propiedad en venta</div>
                            </Label>
                        </div>
                    </Card>

                    <Card className="flex-1 p-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rent" id="rent" />
                            <Label htmlFor="rent" className="cursor-pointer flex-1">
                                <div className="font-semibold">Renta</div>
                                <div className="text-sm text-muted-foreground">Propiedad en renta</div>
                            </Label>
                        </div>
                    </Card>

                    <Card className="flex-1 p-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both" className="cursor-pointer flex-1">
                                <div className="font-semibold">Ambos</div>
                                <div className="text-sm text-muted-foreground">Venta o renta</div>
                            </Label>
                        </div>
                    </Card>
                </RadioGroup>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                    Título de la Propiedad *
                </Label>
                <Input
                    id="title"
                    placeholder="Ej: Hermosa casa en Polanco con jardín"
                    value={data.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                    {data.title?.length || 0}/100 caracteres
                </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                    Descripción
                </Label>
                <Textarea
                    id="description"
                    placeholder="Describe la propiedad en detalle. Incluye características especiales, ubicación, accesos, etc."
                    value={data.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={6}
                    maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                    {data.description?.length || 0}/2000 caracteres
                    {data.description && data.description.length >= 200 && (
                        <span className="text-green-600 ml-2">
                            ✓ Excelente descripción para SEO
                        </span>
                    )}
                </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Currency */}
                <div className="space-y-2">
                    <Label htmlFor="currency" className="text-base font-medium">
                        Moneda *
                    </Label>
                    <Select
                        value={data.currency || 'MXN'}
                        onValueChange={(value) => updateField('currency', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MXN">MXN (Pesos)</SelectItem>
                            <SelectItem value="USD">USD (Dólares)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sale Price */}
                {(data.operation_type === 'sale' || data.operation_type === 'both') && (
                    <div className="space-y-2">
                        <Label htmlFor="sale_price" className="text-base font-medium">
                            Precio de Venta *
                        </Label>
                        <Input
                            id="sale_price"
                            type="number"
                            placeholder="0"
                            value={data.sale_price || ''}
                            onChange={(e) => updateField('sale_price', parseFloat(e.target.value))}
                            min={0}
                            step={10000}
                        />
                    </div>
                )}

                {/* Rent Price */}
                {(data.operation_type === 'rent' || data.operation_type === 'both') && (
                    <div className="space-y-2">
                        <Label htmlFor="rent_price" className="text-base font-medium">
                            Precio de Renta (mensual) *
                        </Label>
                        <Input
                            id="rent_price"
                            type="number"
                            placeholder="0"
                            value={data.rent_price || ''}
                            onChange={(e) => updateField('rent_price', parseFloat(e.target.value))}
                            min={0}
                            step={1000}
                        />
                    </div>
                )}
            </div>

            {/* Preview */}
            {data.title && (data.sale_price || data.rent_price) && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Vista Previa:</h4>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">{data.title}</p>
                        <p className="text-xl font-bold text-blue-900">
                            {data.currency === 'USD' ? '$' : '$'}
                            {(data.sale_price || data.rent_price)?.toLocaleString('es-MX')}
                            {data.currency === 'USD' ? ' USD' : ' MXN'}
                            {data.rent_price && ' /mes'}
                        </p>
                        {data.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {data.description}
                            </p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
