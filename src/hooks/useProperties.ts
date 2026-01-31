'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Property } from '@/types/properties';
import type { PropertyWizardData } from '@/types/property-extended';
import type { FilterState } from '@/components/properties/PropertyFilters';

interface FetchPropertiesParams {
    filters?: FilterState;
    page?: number;
    limit?: number;
}

// Helper to build query params
function buildPropertyParams(filters?: FilterState, page = 1, limit = 10): URLSearchParams {
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

    return params;
}

// Fetch properties with React Query
export function useProperties(params: FetchPropertiesParams = {}) {
    const { filters, page = 1, limit = 10 } = params;

    return useQuery({
        queryKey: ['properties', filters, page, limit],
        queryFn: async () => {
            const urlParams = buildPropertyParams(filters, page, limit);
            const response = await fetch(`/api/properties?${urlParams.toString()}`);

            if (!response.ok) {
                throw new Error('Error fetching properties');
            }

            const { data, meta } = await response.json();
            return { properties: data as Property[], total: meta.total };
        },
        staleTime: 60000, // 1 minute
        retry: 2,
        onError: () => {
            toast.error('Error al cargar propiedades');
        }
    });
}

// Create property mutation
export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, isDraft = false }: { data: PropertyWizardData; isDraft?: boolean }) => {
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

            return response.json();
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isDraft ? 'Borrador guardado' : 'Propiedad publicada con éxito');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al crear propiedad');
        }
    });
}

// Update property mutation
export function useUpdateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PropertyWizardData> }) => {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error updating property');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('Propiedad actualizada');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al actualizar propiedad');
        }
    });
}

// Delete property mutation
export function useDeleteProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error deleting property');
            }

            return id;
        },
        onSuccess: () => {
            toast.success('Propiedad eliminada');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al eliminar propiedad');
        }
    });
}

// Upload image mutation
export function useUploadPropertyImage() {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error uploading image');

            const data = await response.json();
            return data.url as string;
        },
        onError: () => {
            toast.error('Error al subir imagen');
        }
    });
}
