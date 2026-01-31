'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { PROPERTY_AMENITIES, AMENITY_LABELS } from '@/types/property-extended';

export interface FilterState {
    operationType: 'sale' | 'rent' | 'all';
    propertyTypes: string[];
    priceRange: [number, number];
    bedrooms: number | null;
    bathrooms: number | null;
    amenities: string[];
    minHealthScore: number;
    showSharedMLS: boolean;
}

const INITIAL_FILTERS: FilterState = {
    operationType: 'all',
    propertyTypes: [],
    priceRange: [0, 50000000],
    bedrooms: null,
    bathrooms: null,
    amenities: [],
    minHealthScore: 0,
    showSharedMLS: true,
};

interface PropertyFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    className?: string;
}

export function PropertyFilters({ onFilterChange, className }: PropertyFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

    const updateFilters = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const togglePropertyType = (type: string) => {
        const current = filters.propertyTypes;
        const next = current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type];
        updateFilters('propertyTypes', next);
    };

    const toggleAmenity = (amenity: string) => {
        const current = filters.amenities;
        const next = current.includes(amenity)
            ? current.filter((a) => a !== amenity)
            : [...current, amenity];
        updateFilters('amenities', next);
    };

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS);
        onFilterChange(INITIAL_FILTERS);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                </h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={['operation', 'price', 'type']} className="w-full">
                {/* Operation Type */}
                <AccordionItem value="operation">
                    <AccordionTrigger>Operación</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex gap-2">
                            <Button
                                variant={filters.operationType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1"
                                onClick={() => updateFilters('operationType', 'all')}
                            >
                                Todos
                            </Button>
                            <Button
                                variant={filters.operationType === 'sale' ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1"
                                onClick={() => updateFilters('operationType', 'sale')}
                            >
                                Venta
                            </Button>
                            <Button
                                variant={filters.operationType === 'rent' ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1"
                                onClick={() => updateFilters('operationType', 'rent')}
                            >
                                Renta
                            </Button>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                            <Switch
                                id="mls-mode"
                                checked={filters.showSharedMLS}
                                onCheckedChange={(checked) => updateFilters('showSharedMLS', checked)}
                            />
                            <Label htmlFor="mls-mode">Mostrar propiedades MLS</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger>Precio</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>{formatCurrency(filters.priceRange[0])}</span>
                            <span>{formatCurrency(filters.priceRange[1])}+</span>
                        </div>
                        <Slider
                            defaultValue={[0, 50000000]}
                            value={filters.priceRange}
                            max={50000000}
                            step={100000}
                            onValueChange={(val) => updateFilters('priceRange', val as [number, number])}
                        />
                        <div className="flex gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Min</Label>
                                <Input
                                    type="number"
                                    value={filters.priceRange[0]}
                                    onChange={(e) => updateFilters('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Max</Label>
                                <Input
                                    type="number"
                                    value={filters.priceRange[1]}
                                    onChange={(e) => updateFilters('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 0])}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Property Type */}
                <AccordionItem value="type">
                    <AccordionTrigger>Tipo de Propiedad</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                            {['house', 'apartment', 'land', 'commercial', 'office'].map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`type-${type}`}
                                        checked={filters.propertyTypes.includes(type)}
                                        onCheckedChange={() => togglePropertyType(type)}
                                    />
                                    <Label htmlFor={`type-${type}`} className="text-sm font-normal capitalize">
                                        {type === 'house' ? 'Casa' :
                                            type === 'apartment' ? 'Departamento' :
                                                type === 'land' ? 'Terreno' :
                                                    type === 'commercial' ? 'Comercial' : 'Oficina'}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Features */}
                <AccordionItem value="features">
                    <AccordionTrigger>Características</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Recámaras (Min)</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, '5+'].map((num) => (
                                    <Button
                                        key={num}
                                        variant={filters.bedrooms === (typeof num === 'string' ? 5 : num) ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex-1 h-8"
                                        onClick={() => updateFilters('bedrooms', typeof num === 'string' ? 5 : num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Baños (Min)</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, '4+'].map((num) => (
                                    <Button
                                        key={num}
                                        variant={filters.bathrooms === (typeof num === 'string' ? 4 : num) ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex-1 h-8"
                                        onClick={() => updateFilters('bathrooms', typeof num === 'string' ? 4 : num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Health Score */}
                <AccordionItem value="health">
                    <AccordionTrigger>Calidad (Health Score)</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-red-500">Bajo</span>
                            <span className="text-yellow-500">Medio</span>
                            <span className="text-green-500">Alto ({filters.minHealthScore}%)</span>
                        </div>
                        <Slider
                            defaultValue={[0]}
                            value={[filters.minHealthScore]}
                            max={100}
                            step={10}
                            onValueChange={(val) => updateFilters('minHealthScore', val[0])}
                            className="py-2"
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Amenities */}
                <AccordionItem value="amenities">
                    <AccordionTrigger>Amenidades</AccordionTrigger>
                    <AccordionContent>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                            <div className="space-y-2">
                                {PROPERTY_AMENITIES.slice(0, 20).map((amenity) => (
                                    <div key={amenity} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`amenity-${amenity}`}
                                            checked={filters.amenities.includes(amenity)}
                                            onCheckedChange={() => toggleAmenity(amenity)}
                                        />
                                        <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                                            {AMENITY_LABELS[amenity]}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
