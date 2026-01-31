import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Property } from '@/types/properties';
import type { PropertyWizardData } from '@/types/property-extended';
import type { FilterState } from '@/components/properties/PropertyFilters';

export function useProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchProperties = useCallback(async (filters?: FilterState, page = 1, limit = 10) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            if (filters) {
                if (filters.operationType !== 'all') params.append('operation_type', filters.operationType);
                if (filters.propertyTypes.length > 0) params.append('property_type', filters.propertyTypes.join(','));
                if (filters.priceRange) {
                    params.append('min_price', filters.priceRange[0].toString());
                    params.append('max_price', filters.priceRange[1].toString());
                }
                if (filters.bedrooms !== null) params.append('bedrooms', filters.bedrooms.toString());
                if (filters.bathrooms !== null) params.append('bathrooms', filters.bathrooms.toString());
                if (filters.minHealthScore !== undefined) params.append('min_health_score', filters.minHealthScore.toString());
            }

            const response = await fetch(`/api/properties?${params.toString()}`);
            if (!response.ok) throw new Error('Error fetching properties');

            const { data, meta } = await response.json();
            setProperties(data);
            setTotal(meta.total);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar propiedades');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProperty = async (data: PropertyWizardData, isDraft = false) => {
        try {
            const payload = {
                ...data,
                status: isDraft ? 'draft' : 'active',
            };

            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error creating property');
            }

            toast.success(isDraft ? 'Borrador guardado' : 'Propiedad publicada con éxito');
            return await response.json();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al crear propiedad');
            throw error;
        }
    };

    const updateProperty = async (id: string, data: Partial<PropertyWizardData>) => {
        try {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error updating property');
            }

            toast.success('Propiedad actualizada');
            return await response.json();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al actualizar propiedad');
            throw error;
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error deleting property');
            }

            toast.success('Propiedad eliminada');
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al eliminar propiedad');
            throw error;
        }
    };

    const uploadImage = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error uploading image');

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error(error);
            toast.error('Error al subir imagen');
            throw error;
        }
    };

    return {
        properties,
        loading,
        total,
        fetchProperties,
        createProperty,
        updateProperty,
        deleteProperty,
        uploadImage,
    };
}
