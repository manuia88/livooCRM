'use client';

import { useState } from 'react';
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Settings,
    Building2,
    Link as LinkIcon,
    Bell,
    CreditCard,
    Save,
    Mail,
    MessageSquare,
    Smartphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function BackofficeConfigPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaving(false);
        alert('Configuración guardada exitosamente');
    };

    return (
        <PageContainer
            title="Configuración"
            subtitle="Administra las configuraciones del sistema"
            icon={Settings}
            actions={
                <AppleButton
                    onClick={handleSave}
                    disabled={saving}
                    variant="success"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </AppleButton>
            }
        >

            {/* Tabs */}
            <Tabs defaultValue="agency" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="agency">
                        <Building2 className="w-4 h-4 mr-2" />
                        Agencia
                    </TabsTrigger>
                    <TabsTrigger value="integrations">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Integraciones
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="subscription">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Suscripción
                    </TabsTrigger>
                </TabsList>

                {/* Agency Tab */}
                <TabsContent value="agency" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Agencia</CardTitle>
                            <CardDescription>
                                Detalles generales de tu agencia inmobiliaria
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agency-name">Nombre de la Agencia</Label>
                                    <Input
                                        id="agency-name"
                                        placeholder="Livoo Bienes Raíces"
                                        defaultValue="Livoo Bienes Raíces"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agency-phone">Teléfono</Label>
                                    <Input
                                        id="agency-phone"
                                        placeholder="+52 55 1234 5678"
                                        defaultValue="+52 55 1234 5678"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agency-email">Email</Label>
                                <Input
                                    id="agency-email"
                                    type="email"
                                    placeholder="contacto@livoo.mx"
                                    defaultValue="contacto@livoo.mx"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agency-address">Dirección</Label>
                                <Input
                                    id="agency-address"
                                    placeholder="Av. Insurgentes Sur 1234, CDMX"
                                    defaultValue="Av. Insurgentes Sur 1234, CDMX"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agency-website">Sitio Web</Label>
                                <Input
                                    id="agency-website"
                                    placeholder="https://livoo.mx"
                                    defaultValue="https://livoo.mx"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Business</CardTitle>
                            <CardDescription>
                                Configura la integración con WhatsApp Business API
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">Estado</p>
                                        <p className="text-sm text-green-700">
                                            <Badge variant="default" className="bg-green-500">
                                                Conectado
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
                                <Input
                                    id="whatsapp-number"
                                    placeholder="+52 55 1234 5678"
                                    defaultValue="+52 55 1234 5678"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Email (SMTP)</CardTitle>
                            <CardDescription>
                                Configura tu servidor SMTP para envío de emails
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-900">Estado</p>
                                        <p className="text-sm text-blue-700">
                                            <Badge variant="outline">No configurado</Badge>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-host">Host SMTP</Label>
                                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-port">Puerto</Label>
                                    <Input id="smtp-port" placeholder="587" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Google AI</CardTitle>
                            <CardDescription>
                                Integración con Google Generative AI para funciones de IA
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-8 h-8 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-purple-900">Estado</p>
                                        <p className="text-sm text-purple-700">
                                            <Badge variant="default" className="bg-purple-500">
                                                Activo
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline">Ver API Key</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificaciones</CardTitle>
                            <CardDescription>
                                Configura cómo y cuándo recibir notificaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[#2C3E2C]">Nuevos Leads</p>
                                    <p className="text-sm text-[#556B55]">
                                        Recibir notificación cuando llegue un nuevo lead
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[#2C3E2C]">Mensajes de WhatsApp</p>
                                    <p className="text-sm text-[#556B55]">
                                        Alertas de nuevos mensajes en WhatsApp
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[#2C3E2C]">Visitas Programadas</p>
                                    <p className="text-sm text-[#556B55]">
                                        Recordatorios de visitas próximas
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[#2C3E2C]">Reportes Semanales</p>
                                    <p className="text-sm text-[#556B55]">
                                        Resumen semanal de actividad y rendimiento
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Actual</CardTitle>
                            <CardDescription>
                                Detalles de tu suscripción y uso
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-6 bg-gradient-to-r from-[#2C3E2C] to-[#3D5A3D] rounded-xl text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white/80 text-sm">Plan Actual</p>
                                        <h3 className="text-2xl font-bold">Profesional</h3>
                                    </div>
                                    <Badge className="bg-[#B8975A] text-white border-0">Activo</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                                    <div>
                                        <p className="text-white/70 text-xs">Usuarios</p>
                                        <p className="text-lg font-bold">5 / 10</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs">Propiedades</p>
                                        <p className="text-lg font-bold">124 / 500</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs">Almacenamiento</p>
                                        <p className="text-lg font-bold">12GB / 50GB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#F8F7F4] rounded-lg">
                                <div>
                                    <p className="font-medium text-[#2C3E2C]">Próximo Cobro</p>
                                    <p className="text-sm text-[#556B55]">$2,499 MXN el 15 de Febrero 2026</p>
                                </div>
                                <Button variant="outline">Cambiar Plan</Button>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-[#2C3E2C]">Método de Pago</h4>
                                <div className="flex items-center justify-between p-4 border border-[#E5E3DB] rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-[#556B55]" />
                                        <div>
                                            <p className="font-medium text-[#2C3E2C]">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-[#556B55]">Expira 12/2026</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}
