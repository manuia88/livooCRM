
'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';

// Schema for this step
const locationSchema = propertySchema.pick({
    address: true,
    coordinates: true,
    show_exact_location: true,
});

type LocationValues = z.infer<typeof locationSchema>;

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export function LocationStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
        libraries,
        language: 'es',
    });

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

    // Map center logic
    const center = useMemo(() => {
        return form.getValues('coordinates') || { lat: 19.432608, lng: -99.133209 };
    }, [form.getValues('coordinates')]);

    const onLoadMap = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmountMap = useCallback(() => {
        setMap(null);
    }, []);

    const onLoadSearchBox = (ref: google.maps.places.SearchBox) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        if (searchBox) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const location = place.geometry?.location;

                if (location) {
                    const newLat = location.lat();
                    const newLng = location.lng();

                    form.setValue('coordinates', { lat: newLat, lng: newLng });
                    form.setValue('address.formatted_address', place.formatted_address || '');
                    form.setValue('address.place_id', place.place_id || '');

                    // Parse address components
                    place.address_components?.forEach(component => {
                        const types = component.types;
                        if (types.includes('route')) form.setValue('address.street', component.long_name);
                        if (types.includes('street_number')) form.setValue('address.exterior_number', component.long_name);
                        if (types.includes('sublocality') || types.includes('sublocality_level_1')) form.setValue('address.neighborhood', component.long_name);
                        if (types.includes('locality')) form.setValue('address.city', component.long_name);
                        if (types.includes('administrative_area_level_1')) form.setValue('address.state', component.long_name);
                        if (types.includes('postal_code')) form.setValue('address.postal_code', component.long_name);
                        if (types.includes('country')) form.setValue('address.country', component.long_name);
                    });

                    if (map) {
                        map.panTo({ lat: newLat, lng: newLng });
                        map.setZoom(17);
                    }
                }
            }
        }
    };

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            form.setValue('coordinates', { lat: newLat, lng: newLng });
        }
    };

    const onSubmit = (data: LocationValues) => {
        updateFormData(data);
        nextStep();
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Search Map */}
                <div className="space-y-2">
                    <FormLabel>Buscar Ubicación</FormLabel>
                    <StandaloneSearchBox
                        onLoad={onLoadSearchBox}
                        onPlacesChanged={onPlacesChanged}
                    >
                        <Input placeholder="Escribe la dirección para buscar en el mapa..." className="w-full" />
                    </StandaloneSearchBox>
                </div>

                <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200 relative">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={form.getValues('coordinates')}
                        zoom={14}
                        onLoad={onLoadMap}
                        onUnmount={onUnmountMap}
                        onClick={(e) => {
                            if (e.latLng) {
                                form.setValue('coordinates', { lat: e.latLng.lat(), lng: e.latLng.lng() });
                            }
                        }}
                    >
                        <Marker
                            position={form.getValues('coordinates') || { lat: 0, lng: 0 }}
                            draggable
                            onDragEnd={onMarkerDragEnd}
                        />
                    </GoogleMap>
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
