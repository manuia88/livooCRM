'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { PropertiesService } from '@/services/properties';
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
import { useToast } from '@/hooks/use-toast';
import { PropertyImage } from '@/types/properties';

// Validation schema
const ownerSchema = propertySchema.pick({
    owner_id: true,
});

type OwnerValues = z.infer<typeof ownerSchema>;

export function OwnerStep() {
    const router = useRouter();
    const { toast } = useToast();
    const { formData, updateFormData, prevStep, resetForm } = usePropertyFormStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OwnerValues>({
        resolver: zodResolver(ownerSchema) as any,
        defaultValues: {
            owner_id: formData.owner_id ?? '',
        },
    });

    const onSubmit = async (data: OwnerValues) => {
        setIsSubmitting(true);
        try {
            // Updated form data with current step
            updateFormData(data);
            const finalData = { ...formData, ...data };

            // 1. Create Property
            // Remove photos/files from payload initially
            const { photos, ...propertyData } = finalData;

            // Clean up undefined or incompatible fields if needed
            // @ts-ignore
            const newProperty = await PropertiesService.createProperty(propertyData);

            if (!newProperty?.id) {
                throw new Error("No sed pudo crear la propiedad");
            }

            // 2. Upload Images if any
            const imagesToUpload = (photos as PropertyImage[])?.filter(p => p.file) || [];
            if (imagesToUpload.length > 0) {
                const files = imagesToUpload.map(p => p.file!);
                const uploadedUrls = await PropertiesService.uploadPropertyImages(files, newProperty.id);

                // Update property with photo URLs
                if (uploadedUrls.length > 0) {
                    await PropertiesService.updateProperty(newProperty.id, {
                        photos: uploadedUrls
                    });
                }
            }

            toast({
                title: "Propiedad creada",
                description: "La propiedad se ha registrado exitosamente.",
            });

            // Reset store and redirect
            resetForm();
            router.push(`/properties/${newProperty.id}`);

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Hubo un error al crear la propiedad. Intentalo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm mb-6">
                        <p className="font-medium mb-1">Casi terminamos</p>
                        <p>Por ahora, puedes ingresar el ID del propietario si lo conoces, o dejarlo en blanco para asignar más tarde. En el futuro podrás seleccionarlo de tus contactos.</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="owner_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID del Propietario (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. juan-perez-123" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Si no tienes un contacto registrado, puedes dejarlo vacío.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                        Anterior
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando Propiedad...
                            </>
                        ) : (
                            'Finalizar y Crear'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
