'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { PROPERTY_AMENITIES } from '@/constants/amenities';

// Validation schema
const amenitiesSchema = propertySchema.pick({
    amenities: true,
});

type AmenitiesValues = z.infer<typeof amenitiesSchema>;

export function AmenitiesStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

    const form = useForm<AmenitiesValues>({
        resolver: zodResolver(amenitiesSchema) as any,
        defaultValues: {
            amenities: formData.amenities || [],
        },
    });

    const onSubmit = (data: AmenitiesValues) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Amenidades y Servicios</h3>
                    <p className="text-sm text-gray-500">Selecciona las características con las que cuenta la propiedad.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {PROPERTY_AMENITIES.map((category) => (
                        <div key={category.category} className="space-y-4">
                            <h4 className="font-semibold text-gray-900 border-b pb-2">{category.category}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {category.items.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="amenities"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, item.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== item.id
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">
                                                        {item.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={prevStep}>
                        Anterior
                    </Button>
                    <Button type="submit">
                        Siguiente: Multimedia
                    </Button>
                </div>
            </form>
        </Form>
    );
}
