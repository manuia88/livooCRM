'use client';

import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { PropertyCard } from './PropertyCard';
import { PropertyListItem } from './PropertyListItem';
import { PropertyFilters, FilterState } from './PropertyFilters';
import { PropertyWizard } from './PropertyWizard';
import { PropertyShareDialog } from './PropertyShareDialog';
import { useProperties } from '@/hooks/useProperties';
import type { Property } from '@/types/properties';
import type { PropertyWizardData } from '@/types/property-extended';

type ViewMode = 'grid' | 'list';

export default function PropertiesView() {
    const {
        properties,
        loading,
        fetchProperties,
        createProperty,
        updateProperty,
        deleteProperty
    } = useProperties();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState | undefined>();

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Initial load
    useEffect(() => {
        fetchProperties(filters);
    }, [fetchProperties]);

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        fetchProperties(newFilters);
    };

    const handleCreateNew = () => {
        setSelectedProperty(null);
        setIsWizardOpen(true);
    };

    const handleEdit = (property: Property) => {
        setSelectedProperty(property);
        setIsWizardOpen(true);
    };

    const handleShare = (property: Property) => {
        setSelectedProperty(property);
        setIsShareOpen(true);
    };

    const handleDeleteClick = (property: Property) => {
        setSelectedProperty(property);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedProperty) {
            await deleteProperty(selectedProperty.id);
            setIsDeleteOpen(false);
            setSelectedProperty(null);
        }
    };

    const handleSaveProperty = async (data: PropertyWizardData, isDraft: boolean) => {
        if (selectedProperty) {
            // Update existing
            await updateProperty(selectedProperty.id, data);
        } else {
            // Create new
            await createProperty(data, isDraft);
        }
        setIsWizardOpen(false);
        fetchProperties(filters);
    };

    const handlePublishProperty = async (data: PropertyWizardData) => {
        if (selectedProperty) {
            await updateProperty(selectedProperty.id, { ...data, status: 'active' });
        } else {
            await createProperty(data, false);
        }
        setIsWizardOpen(false);
        fetchProperties(filters);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Propiedades</h1>
                    <div className="flex items-center p-1 bg-muted rounded-lg">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Propiedad
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="w-80 border-r bg-background p-6 overflow-y-auto hidden lg:block">
                    <PropertyFilters onFilterChange={handleFilterChange} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-muted/5">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-muted-foreground animate-pulse">Cargando propiedades...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="p-4 rounded-full bg-muted">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No hay propiedades</h3>
                                <p className="text-muted-foreground">Comienza creando tu primera propiedad.</p>
                            </div>
                            <Button onClick={handleCreateNew}>
                                Crear Propiedad
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onEdit={handleEdit}
                                    onShare={handleShare}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {properties.map((property) => (
                                <PropertyListItem
                                    key={property.id}
                                    property={property}
                                    onEdit={handleEdit}
                                    onShare={handleShare}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Dialogs */}

            {/* Wizard Dialog */}
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-y-auto border-none sm:rounded-xl">
                    <PropertyWizard
                        propertyId={selectedProperty?.id}
                        initialData={selectedProperty ? (selectedProperty as unknown as PropertyWizardData) : undefined}
                        onSave={handleSaveProperty}
                        onPublish={handlePublishProperty}
                    />
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent className="sm:max-w-md">
                    {selectedProperty && (
                        <PropertyShareDialog
                            property={selectedProperty}
                            isOpen={isShareOpen}
                            onClose={() => setIsShareOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará la propiedad "{selectedProperty?.title}" permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
