'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Video, Box, Trash2 } from 'lucide-react';
import type { PropertyFormStep5 } from '@/types/property-extended';

interface Step5MultimediaProps {
    data: Partial<PropertyFormStep5>;
    onChange: (data: Partial<PropertyFormStep5>) => void;
}

export function Step5Multimedia({ data, onChange }: Step5MultimediaProps) {
    const [videoUrl, setVideoUrl] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files).map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                file,
            }));
            onChange({ ...data, photos: [...(data.photos || []), ...newPhotos] });
        }
    };

    const removePhoto = (id: string) => {
        onChange({
            ...data,
            photos: data.photos?.filter((p) => p.id !== id),
        });
    };

    const addVideo = () => {
        if (videoUrl) {
            onChange({
                ...data,
                videos: [...(data.videos || []), videoUrl],
            });
            setVideoUrl('');
        }
    };

    const removeVideo = (index: number) => {
        const newVideos = [...(data.videos || [])];
        newVideos.splice(index, 1);
        onChange({ ...data, videos: newVideos });
    };

    const updateField = (field: keyof PropertyFormStep5, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Multimedia</h2>
                <p className="text-muted-foreground">
                    Carga fotos de alta calidad, videos y tours virtuales para destacar la propiedad.
                </p>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Fotografías ({data.photos?.length || 0})
                    </Label>
                    <span className="text-sm text-muted-foreground">
                        Mínimo 5 fotos recomendadas
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Upload Button */}
                    <div className="relative border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/5 hover:bg-muted/10 transition-colors rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer group">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center space-y-2 text-muted-foreground group-hover:text-primary transition-colors">
                            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <Upload className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-sm">Subir Fotos</span>
                        </div>
                    </div>

                    {/* Photo Previews */}
                    {data.photos?.map((photo, index) => (
                        <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                            <img
                                src={photo.url}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-sm"
                                    onClick={() => removePhoto(photo.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded badge">
                                    Principal
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Videos Section */}
            <div className="space-y-4 pt-6 border-t">
                <Label className="text-lg font-medium flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Videos ({data.videos?.length || 0})
                </Label>

                <div className="flex gap-2">
                    <Input
                        placeholder="Pega la URL del video (YouTube, Vimeo)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button onClick={addVideo} disabled={!videoUrl}>
                        Agregar
                    </Button>
                </div>

                {data.videos && data.videos.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {data.videos.map((url, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded bg-muted/20">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm truncate max-w-[300px]">{url}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => removeVideo(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Virtual Tour Section */}
            <div className="space-y-4 pt-6 border-t">
                <Label className="text-lg font-medium flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    Tour Virtual 360°
                </Label>

                <div className="space-y-2">
                    <Input
                        placeholder="URL del Tour Virtual (Matterport, Kuula, etc.)"
                        value={data.virtual_tour_url || ''}
                        onChange={(e) => updateField('virtual_tour_url', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Agrega un recorrido virtual para aumentar significativamente el interés (y 15 puntos de Health Score).
                    </p>
                </div>
            </div>

            {/* Floor Plan */}
            <div className="space-y-4 pt-6 border-t">
                <Label className="text-lg font-medium">Plano Arquitectónico (URL)</Label>
                <Input
                    placeholder="URL de la imagen o PDF del plano"
                    value={data.floor_plan_url || ''}
                    onChange={(e) => updateField('floor_plan_url', e.target.value)}
                />
            </div>
        </div>
    );
}
