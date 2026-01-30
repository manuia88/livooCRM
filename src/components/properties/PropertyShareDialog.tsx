'use client';

import { useState } from 'react';
import { Copy, Check, Share2, QrCode, ExternalLink, Calendar } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Property } from '@/types/properties';
import type { ShareMode } from '@/types/property-extended';

interface PropertyShareDialogProps {
    property: Property;
    onShare?: (mode: ShareMode, customData?: any) => Promise<string>;
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

export function PropertyShareDialog({ property, onShare, children, isOpen, onClose }: PropertyShareDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = isOpen !== undefined;
    const show = isControlled ? isOpen : internalOpen;

    const handleOpenChange = (val: boolean) => {
        if (!isControlled) setInternalOpen(val);
        if (!val && onClose) onClose();
    };

    const [shareMode, setShareMode] = useState<ShareMode>('original');
    const [shareLink, setShareLink] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    // White label custom data
    const [customAgentName, setCustomAgentName] = useState('');
    const [customAgentPhone, setCustomAgentPhone] = useState('');
    const [customAgentEmail, setCustomAgentEmail] = useState('');
    const [customAgencyName, setCustomAgencyName] = useState('');

    // Expiration
    const [expiresInDays, setExpiresInDays] = useState<number>(30);

    const handleGenerateShare = async () => {
        setLoading(true);
        try {
            const customData = shareMode === 'white_label' ? {
                custom_agent_name: customAgentName,
                custom_agent_phone: customAgentPhone,
                custom_agent_email: customAgentEmail,
                custom_agency_name: customAgencyName,
            } : undefined;

            const link = await onShare?.(shareMode, customData) || `https://livoo.mx/p/${property.id}?mode=${shareMode}`;
            setShareLink(link);

            // Generate QR code (public API)
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`);
        } catch (error) {
            console.error('Error generating share link:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenPreview = () => {
        if (shareLink) {
            window.open(shareLink, '_blank');
        }
    };

    return (
        <Dialog open={show} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Compartir Propiedad</DialogTitle>
                    <DialogDescription>
                        {property.title}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="mode" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="mode">Configuración</TabsTrigger>
                        <TabsTrigger value="preview" disabled={!shareLink}>Vista Previa</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mode" className="space-y-4">
                        {/* Share Mode Selection Manual Radio */}
                        <div className="space-y-3">
                            <Label>Modalidad de compartir</Label>
                            <div className="grid gap-3">
                                {/* White Label */}
                                <Card
                                    className={`p-4 cursor-pointer border-2 transition-colors ${shareMode === 'white_label' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                                    onClick={() => setShareMode('white_label')}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shareMode === 'white_label' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {shareMode === 'white_label' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-semibold">🏷️ Con mis datos (White Label)</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Reemplaza los datos del productor por los tuyos.
                                    </p>

                                    {shareMode === 'white_label' && (
                                        <div className="mt-4 space-y-3 pl-6 animate-in fade-in slide-in-from-top-1">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Tu nombre</Label>
                                                    <Input value={customAgentName} onChange={e => setCustomAgentName(e.target.value)} placeholder="Tu Nombre" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Tu teléfono</Label>
                                                    <Input value={customAgentPhone} onChange={e => setCustomAgentPhone(e.target.value)} placeholder="Tu Teléfono" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* MLS */}
                                <Card
                                    className={`p-4 cursor-pointer border-2 transition-colors ${shareMode === 'mls' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                                    onClick={() => setShareMode('mls')}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shareMode === 'mls' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {shareMode === 'mls' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-semibold">🤝 Para colegas (MLS)</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Muestra comisión compartida. Para otros agentes.
                                    </p>
                                </Card>

                                {/* Original */}
                                <Card
                                    className={`p-4 cursor-pointer border-2 transition-colors ${shareMode === 'original' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                                    onClick={() => setShareMode('original')}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shareMode === 'original' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {shareMode === 'original' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-semibold">📋 Original</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Datos originales del productor. Sin comisión.
                                    </p>
                                </Card>
                            </div>
                        </div>

                        {/* Expiration */}
                        <div className="space-y-2 pt-2 border-t">
                            <Label>Expiración del link (días)</Label>
                            <Input
                                type="number"
                                min={1}
                                max={365}
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                                className="w-full"
                            />
                        </div>

                        <Button
                            onClick={handleGenerateShare}
                            disabled={loading || (shareMode === 'white_label' && !customAgentName)}
                            className="w-full"
                        >
                            {loading ? 'Generando...' : 'Generar Link'}
                        </Button>
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6">
                        {shareLink && (
                            <>
                                <div className="space-y-2">
                                    <Label>Link generado</Label>
                                    <div className="flex gap-2">
                                        <Input value={shareLink} readOnly className="font-mono text-xs" />
                                        <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border">
                                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />}
                                    <p className="text-xs text-muted-foreground mt-2">Escanear para abrir</p>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
