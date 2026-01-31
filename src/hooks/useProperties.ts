'use client';

import { useState, useCallback } from 'react';
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

/**
 * Unified Hook for Properties (Facade pattern expected by PropertiesView)
 */
export function useProperties() {
    const queryClient = useQueryClient();
    const [currentFilters, setCurrentFilters] = useState<FilterState | undefined>();
    const [page, setPage] = useState(1);

    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['properties', currentFilters, page],
        queryFn: async () => {
            const urlParams = buildPropertyParams(currentFilters, page);
            const response = await fetch(`/api/properties?${urlParams.toString()}`);

            if (!response.ok) {
                throw new Error('Error fetching properties');
            }

            const result = await response.json();
            return {
                properties: (result.data || []) as Property[],
                total: result.meta?.total || 0
            };
        },
        staleTime: 60000,
    });

    const fetchProperties = useCallback((filters?: FilterState) => {
        setCurrentFilters(filters);
        setPage(1);
    }, []);

    const createMutation = useMutation({
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

    const updateMutation = useMutation({
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

    const deleteMutation = useMutation({
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

    return {
        properties: data?.properties || [],
        total: data?.total || 0,
        loading,
        fetchProperties,
        createProperty: (data: PropertyWizardData, isDraft?: boolean) => createMutation.mutateAsync({ data, isDraft }),
        updateProperty: (id: string, data: Partial<PropertyWizardData>) => updateMutation.mutateAsync({ id, data }),
        deleteProperty: (id: string) => deleteMutation.mutateAsync(id),
        refetch
    };
}

// Keep individual mutations for specialized uses if needed
export function useCreateProperty() {
    const { createProperty } = useProperties();
    return { mutateAsync: createProperty };
}

export function useUpdateProperty() {
    const { updateProperty } = useProperties();
    return { mutateAsync: updateProperty };
}

export function useDeleteProperty() {
    const { deleteProperty } = useProperties();
    return { mutateAsync: deleteProperty };
}

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
