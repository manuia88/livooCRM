'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

// Validation schema
const mlsSchema = propertySchema.pick({
    shared_in_mls: true,
    commission_shared: true,
    commission_percentage: true,
    commission_amount: true,
    is_exclusive: true,
});

type MlsValues = z.infer<typeof mlsSchema>;

export function MlsStep() {
    const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

    const form = useForm<MlsValues>({
        resolver: zodResolver(mlsSchema) as any,
        defaultValues: {
            shared_in_mls: formData.shared_in_mls ?? false,
            commission_shared: formData.commission_shared ?? false,
            commission_percentage: formData.commission_percentage,
            commission_amount: formData.commission_amount,
            is_exclusive: formData.is_exclusive ?? false,
        },
    });

    const isCommissionShared = form.watch('commission_shared');

    const onSubmit = (data: MlsValues) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="rounded-md border p-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="shared_in_mls"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Compartir en MLS
                                    </FormLabel>
                                    <FormDescription>
                                        Al activar, esta propiedad será visible para otros agentes en la red MLS.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="rounded-md border p-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="commission_shared"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Comisión Compartida
                                    </FormLabel>
                                    <FormDescription>
                                        Indica si compartes comisión con otros asesores.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {isCommissionShared && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 pt-2">
                            <FormField
                                control={form.control}
                                name="commission_percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Porcentaje Compartido (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Ej. 1.5"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                                step="0.1"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="commission_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Fijo (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className="rounded-md border p-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="is_exclusive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Propiedad en Exclusiva
                                    </FormLabel>
                                    <FormDescription>
                                        Marca si cuentas con el contrato de exclusividad firmado.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={prevStep}>
                        Anterior
                    </Button>
                    <Button type="submit">
                        Siguiente: Propietario
                    </Button>
                </div>
            </form>
        </Form>
    );
}
