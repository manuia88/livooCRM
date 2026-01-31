'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Eye, Home, Calendar } from 'lucide-react';
import type { PropertyWizardData } from '@/types/property-extended';

interface Step7ReviewProps {
    data: Partial<PropertyWizardData>;
    onChange: (data: Partial<PropertyWizardData>) => void;
    healthScore: number;
}

export function Step7Review({ data, onChange, healthScore }: Step7ReviewProps) {
    const isReady = healthScore >= 60 && data.confirm_publish;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">¡Casi listo!</h2>
                <p className="text-muted-foreground">
                    Revisa la información antes de publicar.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Summary Card */}
                <Card className="md:col-span-2 bg-muted/10 border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Resumen de Publicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Propiedad</span>
                            <p className="font-semibold text-lg">{data.title || 'Sin Título'}</p>
                            <p>{data.property_type} • {data.operation_type}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Precio</span>
                            <p className="font-semibold text-lg">
                                ${(data.sale_price || data.rent_price || 0).toLocaleString()} {data.currency}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Ubicación</span>
                            <p className="truncate" title={data.address?.formatted_address}>
                                {data.address?.neighborhood}, {data.address?.city}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Multimedia</span>
                            <p>{data.photos?.length || 0} Fotos</p>
                            <p>{data.videos?.length || 0} Videos</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Características</span>
                            <p>{data.bedrooms} Hab • {data.bathrooms} Baños</p>
                            <p>{data.construction_m2} m² Const.</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium block uppercase text-xs tracking-wider">Estado</span>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {isReady ? 'Listo para Publicar' : 'Revisión Pendiente'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Health Score Check */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        Verificación de Calidad
                    </h3>

                    <div className={`p-4 rounded-lg border flex items-start gap-4 ${healthScore >= 80 ? 'bg-green-50 border-green-200' :
                            healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                        }`}>
                        <div className={`text-2xl font-bold p-3 rounded-full border-4 w-16 h-16 flex items-center justify-center bg-white ${healthScore >= 80 ? 'text-green-600 border-green-600' :
                                healthScore >= 60 ? 'text-yellow-600 border-yellow-600' :
                                    'text-red-600 border-red-600'
                            }`}>
                            {healthScore}
                        </div>

                        <div className="space-y-1">
                            <p className="font-semibold">Health Score: {
                                healthScore >= 80 ? 'Excelente' :
                                    healthScore >= 60 ? 'Aceptable' :
                                        'Bajo'
                            }</p>
                            <p className="text-sm text-muted-foreground">
                                {healthScore >= 60
                                    ? 'Tu propiedad cumple con los estándares mínimos de calidad para ser publicada y compartida en MLS.'
                                    : 'Necesitas mejorar la calidad de la ficha para poder publicar. Agrega más fotos, descripción o ubicación exacta.'}
                            </p>
                        </div>
                    </div>

                    {healthScore < 60 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Acción Requerida</AlertTitle>
                            <AlertDescription>
                                No podrás publicar hasta alcanzar un score mínimo de 60.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Policies and Confirmation */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Confirmación</h3>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                disabled={healthScore < 60}
                                checked={data.confirm_publish || false}
                                onCheckedChange={(checked) => onChange({ ...data, confirm_publish: checked as boolean })}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Confirmo que la información es verídica
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Al publicar, aceptas los términos de uso y políticas de privacidad de Livoo.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded border">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>La propiedad será visible en tu sitio web</span>
                        </div>

                        {data.shared_in_mls && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100">
                                <Home className="h-4 w-4 text-blue-600" />
                                <span>Se compartirá en la red MLS con otros agentes</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
