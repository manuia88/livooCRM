'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, DollarSign, Handshake, ShieldCheck, UserPlus } from 'lucide-react';
import type { PropertyFormStep6 } from '@/types/property-extended';

// Mock owners for selection
const MOCK_OWNERS = [
    { id: '1', name: 'Roberto Gómez', email: 'roberto@email.com', phone: '5512345678' },
    { id: '2', name: 'Ana Martínez', email: 'ana@email.com', phone: '5587654321' },
];

interface Step6OwnerProps {
    data: Partial<PropertyFormStep6>;
    onChange: (data: Partial<PropertyFormStep6>) => void;
}

export function Step6Owner({ data, onChange }: Step6OwnerProps) {
    const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const updateField = (field: keyof PropertyFormStep6, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const filteredOwners = MOCK_OWNERS.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Propietario y Acuerdos</h2>
                <p className="text-muted-foreground">
                    Define quién es el propietario y las condiciones comerciales de la captación.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Owner Selection */}
                <div className="space-y-4">
                    <Label className="text-lg font-medium">Propietario *</Label>

                    <div className="relative">
                        <Input
                            placeholder="Buscar propietario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                        {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner) => (
                                <div
                                    key={owner.id}
                                    className={`
                    p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50
                    ${data.owner_id === owner.id ? 'bg-primary/5 border-l-4 border-primary' : ''}
                  `}
                                    onClick={() => updateField('owner_id', owner.id)}
                                >
                                    <div>
                                        <p className="font-medium">{owner.name}</p>
                                        <p className="text-xs text-muted-foreground">{owner.email}</p>
                                    </div>
                                    {data.owner_id === owner.id && (
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                            Seleccionado
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                No se encontraron propietarios.
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowNewOwnerForm(!showNewOwnerForm)}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Crear Nuevo Propietario
                    </Button>

                    {showNewOwnerForm && (
                        <Card className="mt-4 bg-muted/20 border-dashed">
                            <CardContent className="pt-6 space-y-3">
                                <Input placeholder="Nombre Completo" />
                                <Input placeholder="Email" type="email" />
                                <Input placeholder="Teléfono" type="tel" />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setShowNewOwnerForm(false)}>Cancelar</Button>
                                    <Button size="sm">Guardar Propietario</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Commission & Terms */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Comisión
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Compartir Comisión</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Habilitar para MLS y compartir con colegas
                                    </p>
                                </div>
                                <Switch
                                    checked={data.commission_shared}
                                    onCheckedChange={(checked) => updateField('commission_shared', checked)}
                                />
                            </div>

                            {data.commission_shared && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="percentage">% Compartido</Label>
                                        <Input
                                            id="percentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            disabled={!data.commission_shared}
                                            value={data.commission_percentage || ''}
                                            onChange={(e) => updateField('commission_percentage', parseFloat(e.target.value))}
                                            placeholder="50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Monto Fijo (Opcional)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            disabled={!data.commission_shared}
                                            value={data.commission_amount || ''}
                                            onChange={(e) => updateField('commission_amount', parseFloat(e.target.value))}
                                            placeholder="$"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Exclusividad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Contrato de Exclusividad</Label>
                                    <p className="text-xs text-muted-foreground">
                                        ¿Tienes la exclusiva de esta propiedad?
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_exclusive}
                                    onCheckedChange={(checked) => updateField('is_exclusive', checked)}
                                />
                            </div>

                            {data.is_exclusive && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Vence el:
                                    </Label>
                                    <Input
                                        type="date"
                                        value={data.exclusivity_expires_at || ''}
                                        onChange={(e) => updateField('exclusivity_expires_at', e.target.value)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
