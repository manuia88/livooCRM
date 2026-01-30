'use client';

import { PropertyStats } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, MessageCircle, Clock } from 'lucide-react';

interface PropertyStatsProps {
    properties: PropertyStats[];
}

export function PropertyStatsTable({ properties }: PropertyStatsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analítica de Propiedades</CardTitle>
                <CardDescription>Rendimiento de listados activos</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Propiedad</TableHead>
                            <TableHead className="text-center">Vistas</TableHead>
                            <TableHead className="text-center">Contactos</TableHead>
                            <TableHead className="text-center">Días en Mercado</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Gap Mercado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((property) => {
                            const gap = ((property.listedPrice - property.averageMarketPrice) / property.averageMarketPrice) * 100;
                            const isOverpriced = gap > 5;
                            const isUnderpriced = gap < -5;

                            return (
                                <TableRow key={property.id}>
                                    <TableCell className="font-medium">{property.title}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                            {property.views}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                            {property.contacts}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            {property.daysOnMarket}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(property.listedPrice)}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${isOverpriced ? 'text-red-500' : isUnderpriced ? 'text-emerald-500' : 'text-yellow-600'}`}>
                                        {gap > 0 ? '+' : ''}{gap.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
