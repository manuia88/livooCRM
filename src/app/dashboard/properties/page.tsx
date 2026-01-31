import { Suspense } from 'react';
import PropertiesView from '@/components/properties/PropertiesView';

export const metadata = {
    title: 'Propiedades | CRM',
    description: 'Gestión de inventario inmobiliario',
};

export default function PropertiesPage() {
    return (
        <div className="h-full w-full">
            <Suspense fallback={<div>Cargando dashboard...</div>}>
                <PropertiesView />
            </Suspense>
        </div>
    );
}
