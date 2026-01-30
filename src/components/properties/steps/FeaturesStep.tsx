'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Create a schema for just this step to allow partial validation
const featuresSchema = propertySchema.pick({
    bedrooms: true,
    bathrooms: true,
    half_bathrooms: true,
    parking_spaces: true,
    construction_m2: true,
    land_m2: true,
    total_m2: true,
    floors: true,
    floor_number: true,
    year_built: true,
    condition: true,
});

type FeaturesValues = z.infer<typeof featuresSchema>;

export function FeaturesStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

    const form = useForm<FeaturesValues>({
        resolver: zodResolver(featuresSchema),
        defaultValues: {
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            half_bathrooms: formData.half_bathrooms,
            parking_spaces: formData.parking_spaces,
            construction_m2: formData.construction_m2,
            land_m2: formData.land_m2,
            total_m2: formData.total_m2,
            floors: formData.floors,
            floor_number: formData.floor_number,
            year_built: formData.year_built,
            condition: formData.condition || undefined,
        },
    });

    const onSubmit = (data: FeaturesValues) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Distribución */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Distribución</h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="bedrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recámaras</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Baños Completos</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="half_bathrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medios Baños</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="parking_spaces"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estacionamientos</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Superficies */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Superficies (m²)</h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="construction_m2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Construcción</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="land_m2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Terreno</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="total_m2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Detalles Adicionales */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Detalles del Edificio</h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="floors"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Niveles Totales</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="floor_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Piso de la Propiedad</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="year_built"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Año de Construcción</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Condición</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="new">Nuevo</SelectItem>
                                            <SelectItem value="excellent">Excelente</SelectItem>
                                            <SelectItem value="good">Bueno</SelectItem>
                                            <SelectItem value="needs_repair">Para remodelar</SelectItem>
                                            <SelectItem value="under_construction">En construcción</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
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
                        Siguiente: Amenidades
                    </Button>
                </div>
            </form>
        </Form>
    );
}
