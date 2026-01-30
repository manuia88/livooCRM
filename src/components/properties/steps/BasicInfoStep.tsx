
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertySchema } from '@/lib/validations/property';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Create a schema for just this step to allow partial validation
const basicInfoSchema = propertySchema.pick({
    title: true,
    description: true,
    property_type: true,
    operation_type: true,
    status: true,
    price_sale: true, // Note: Schema uses sale_price, checking form store match
    sale_price: true,
    rent_price: true,
    currency: true,
    maintenance_fee: true,
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

export function BasicInfoStep() {
    const { formData, updateFormData, nextStep } = usePropertyFormStore();

    const form = useForm<BasicInfoValues>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            title: formData.title || '',
            description: formData.description || '',
            property_type: formData.property_type as any || undefined,
            operation_type: formData.operation_type || undefined,
            status: formData.status || 'draft',
            sale_price: formData.sale_price,
            rent_price: formData.rent_price,
            currency: formData.currency || 'MXN',
            maintenance_fee: formData.maintenance_fee,
        },
    });

    const onSubmit = (data: BasicInfoValues) => {
        updateFormData(data);
        nextStep();
    };

    const operationType = form.watch('operation_type');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título del Anuncio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Casa moderna en Lomas de Chapultepec" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estatus</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Borrador</SelectItem>
                                            <SelectItem value="active">Activa</SelectItem>
                                            <SelectItem value="reserved">Reservada</SelectItem>
                                            <SelectItem value="sold">Vendida</SelectItem>
                                            <SelectItem value="rented">Rentada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <FormField
                            control={form.control}
                            name="property_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Propiedad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="house">Casa</SelectItem>
                                            <SelectItem value="apartment">Departamento</SelectItem>
                                            <SelectItem value="condo">Condominio</SelectItem>
                                            <SelectItem value="land">Terreno</SelectItem>
                                            <SelectItem value="commercial">Comercial</SelectItem>
                                            <SelectItem value="office">Oficina</SelectItem>
                                            <SelectItem value="development">Desarrollo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <FormField
                            control={form.control}
                            name="operation_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Operación</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar operación" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="sale">Venta</SelectItem>
                                            <SelectItem value="rent">Renta</SelectItem>
                                            <SelectItem value="both">Ambas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe los detalles más atractivos de la propiedad..."
                                            className="resize-y"
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Moneda</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="MXN" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MXN">Pesos (MXN)</SelectItem>
                                            <SelectItem value="USD">Dólares (USD)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {(operationType === 'sale' || operationType === 'both') && (
                        <div className="sm:col-span-2">
                            <FormField
                                control={form.control}
                                name="sale_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Venta</FormLabel>
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

                    {(operationType === 'rent' || operationType === 'both') && (
                        <div className="sm:col-span-2">
                            <FormField
                                control={form.control}
                                name="rent_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Renta</FormLabel>
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

                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="maintenance_fee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mantenimiento (Mensual)</FormLabel>
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

                </div>

                <div className="flex justify-end pt-6">
                    <Button type="submit">
                        Siguiente: Ubicación
                    </Button>
                </div>
            </form>
        </Form>
    );
}
