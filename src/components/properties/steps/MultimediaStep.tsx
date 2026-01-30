'use client';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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
} from '@/components/ui/form';
import { PropertyImage } from '@/types/properties';

// Validation schema
const multimediaSchema = propertySchema.pick({
    photos: true,
    virtual_tour_url: true,
    floor_plan_url: true,
    // videos: true, // Future implementation
});

type MultimediaValues = z.infer<typeof multimediaSchema>;

export function MultimediaStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

    const form = useForm<MultimediaValues>({
        resolver: zodResolver(multimediaSchema) as any,
        defaultValues: {
            photos: formData.photos || [],
            virtual_tour_url: formData.virtual_tour_url ?? '',
            floor_plan_url: formData.floor_plan_url ?? '',
        },
    });

    const photos = form.watch('photos') as PropertyImage[];

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newPhotos: PropertyImage[] = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            url: URL.createObjectURL(file), // Create preview URL
            file: file
        }));

        const currentPhotos = form.getValues('photos') as PropertyImage[];
        form.setValue('photos', [...currentPhotos, ...newPhotos], { shouldValidate: true });
    }, [form]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': []
        },
        multiple: true
    });

    const removePhoto = (id: string) => {
        const currentPhotos = form.getValues('photos') as PropertyImage[];
        form.setValue('photos', currentPhotos.filter(photo => photo.id !== id));
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            photos?.forEach(photo => {
                if (photo.file) {
                    URL.revokeObjectURL(photo.url);
                }
            });
        };
    }, []);

    const onSubmit = (data: MultimediaValues) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Image Upload Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Fotografías</h3>
                            <p className="text-sm text-gray-500">Arrastra tus fotos aquí o haz clic para seleccionar. Se recomienda alta resolución.</p>
                        </div>
                        <span className="text-sm text-gray-400">{photos?.length || 0} fotos</span>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer flex flex-col items-center justify-center text-center
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="rounded-full bg-gray-100 p-4 mb-4">
                            <Upload className="h-6 w-6 text-gray-600" />
                        </div>
                        {isDragActive ? (
                            <p className="text-primary font-medium">¡Suelta las imágenes aquí!</p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                    <span className="text-primary hover:text-primary/90">Sube un archivo</span> o arrastra y suelta
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Image Grid */}
                    {photos?.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                            {photos.map((photo, index) => (
                                <div key={photo.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photo.url}
                                        alt={`Property photo ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(photo.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs font-medium text-white">
                                            Portada
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Other Media Links */}
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-medium">Tours Virtuales y Planos</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <FormField
                            control={form.control}
                            name="virtual_tour_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Tour Virtual (Matterport, etc)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="floor_plan_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL de Planos</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value ?? ''} />
                                    </FormControl>
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
                        Siguiente: MLS y Colaboración
                    </Button>
                </div>
            </form>
        </Form>
    );
}
