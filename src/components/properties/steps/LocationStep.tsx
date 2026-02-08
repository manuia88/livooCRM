'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';

// Dynamic import for LocationPicker (Map container requires window)
const LocationPicker = dynamic(
    () => import('@/components/maps/LocationPicker'),
    {
        ssr: false,
        loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Cargando Mapa...</div>
    }
);

// Schema for this step
const locationSchema = propertySchema.pick({
    address: true,
    coordinates: true,
    show_exact_location: true,
});

type LocationValues = z.infer<typeof locationSchema>;

export function LocationStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

    const form = useForm<LocationValues>({
        resolver: zodResolver(locationSchema) as any,
        defaultValues: {
            address: {
                street: formData.address?.street ?? '',
                exterior_number: formData.address?.exterior_number ?? '',
                interior_number: formData.address?.interior_number ?? '',
                neighborhood: formData.address?.neighborhood ?? '',
                city: formData.address?.city ?? '',
                state: formData.address?.state ?? '',
                postal_code: formData.address?.postal_code ?? '',
                country: formData.address?.country ?? 'México',
                formatted_address: formData.address?.formatted_address ?? '',
                place_id: formData.address?.place_id ?? '',
            },
            coordinates: formData.coordinates ?? { lat: 19.432608, lng: -99.133209 }, // CDMX default
            show_exact_location: formData.show_exact_location ?? false,
        },
    });

    const handleAddressSelect = (address: string, coordinates: { lat: number; lng: number }, details: any) => {
        form.setValue('coordinates', coordinates);
        form.setValue('address.formatted_address', address);

        // Map OSM details to our form (OSM details vary by result)
        if (details) {
            if (details.road) form.setValue('address.street', details.road);
            if (details.house_number) form.setValue('address.exterior_number', details.house_number);
            if (details.suburb) form.setValue('address.neighborhood', details.suburb);
            if (details.city || details.town || details.village) {
                form.setValue('address.city', details.city || details.town || details.village);
            }
            if (details.state) form.setValue('address.state', details.state);
            if (details.postcode) form.setValue('address.postal_code', details.postcode);
            if (details.country) form.setValue('address.country', details.country);
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        form.setValue('coordinates', { lat, lng });
    };

    const onSubmit = (data: LocationValues) => {
        updateFormData(data);
        nextStep();
    };

    const currentCoords = form.watch('coordinates');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Search Map */}
                <div className="space-y-2">
                    <FormLabel>Buscar Ubicación</FormLabel>
                    <AddressAutocomplete
                        onAddressSelect={handleAddressSelect}
                        defaultValue={form.getValues('address.formatted_address')}
                        placeholder="Escribe la dirección para buscar en el mapa..."
                    />
                </div>

                <div className="space-y-2">
                    <FormLabel>Ubica la propiedad en el mapa (puedes arrastrar el marcador)</FormLabel>
                    <LocationPicker
                        initialPosition={currentCoords ? [currentCoords.lat, currentCoords.lng] : [19.432608, -99.133209]}
                        onLocationSelect={handleLocationSelect}
                        height="400px"
                    />
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calle</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <FormField
                            control={form.control}
                            name="address.exterior_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No. Ext</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <FormField
                            control={form.control}
                            name="address.interior_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No. Int</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <FormField
                            control={form.control}
                            name="address.neighborhood"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colonia / Barrio</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <FormField
                            control={form.control}
                            name="address.city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad / Municipio</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="address.state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="address.postal_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código Postal</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="address.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>País</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="show_exact_location"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Mostrar ubicación exacta
                                        </FormLabel>
                                        <FormDescription>
                                            Si se marca, la ubicación exacta se mostrará en el mapa público. De lo contrario, se mostrará un radio aproximado.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={prevStep}>
                        Anterior
                    </Button>
                    <Button type="submit">
                        Siguiente: Características
                    </Button>
                </div>
            </form>
        </Form>
    );
}
