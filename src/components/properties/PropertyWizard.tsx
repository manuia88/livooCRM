'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PropertyHealthScore } from './PropertyHealthScore';
import type { PropertyWizardData, HealthScoreBreakdown } from '@/types/property-extended';

// Import individual steps (we'll create these next)
import { Step1BasicInfo } from './PropertyWizard/Step1BasicInfo';
import { Step2Location } from './PropertyWizard/Step2Location';
import { Step3Features } from './PropertyWizard/Step3Features';
import { Step4Amenities } from './PropertyWizard/Step4Amenities';
import { Step5Multimedia } from './PropertyWizard/Step5Multimedia';
import { Step6Owner } from './PropertyWizard/Step6Owner';
import { Step7Review } from './PropertyWizard/Step7Review';

interface PropertyWizardProps {
    propertyId?: string; // If editing existing property
    initialData?: Partial<PropertyWizardData>;
    onSave?: (data: PropertyWizardData, isDraft: boolean) => Promise<void>;
    onPublish?: (data: PropertyWizardData) => Promise<void>;
}

const STEPS = [
    { number: 1, title: 'Información Básica', component: Step1BasicInfo, optional: false },
    { number: 2, title: 'Ubicación', component: Step2Location, optional: false },
    { number: 3, title: 'Características', component: Step3Features, optional: false },
    { number: 4, title: 'Amenidades', component: Step4Amenities, optional: true },
    { number: 5, title: 'Multimedia', component: Step5Multimedia, optional: true },
    { number: 6, title: 'Propietario', component: Step6Owner, optional: true },
    { number: 7, title: 'Revisión', component: Step7Review, optional: false },
];

export function PropertyWizard({
    propertyId,
    initialData,
    onSave,
    onPublish
}: PropertyWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<PropertyWizardData>>(initialData || {});
    const [healthScore, setHealthScore] = useState(0);
    const [healthBreakdown, setHealthBreakdown] = useState<HealthScoreBreakdown | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Calculate progress percentage
    const progress = (currentStep / STEPS.length) * 100;

    // Update form data for a specific step
    const updateStepData = (stepData: Partial<PropertyWizardData>) => {
        setFormData((prev) => ({ ...prev, ...stepData }));

        // Mark step as completed
        setCompletedSteps((prev) => new Set(prev).add(currentStep));

        // Recalculate health score (you'd call API here)
        calculateHealthScore({ ...formData, ...stepData });
    };

    // Calculate health score based on current data
    const calculateHealthScore = async (data: Partial<PropertyWizardData>) => {
        // Simplified client-side calculation (should match backend logic)
        let score = 0;

        // GPS coordinates (10 points)
        if (data.coordinates) score += 10;

        // Photos (20 points)
        const photoCount = data.photos?.length || 0;
        if (photoCount >= 15) score += 20;
        else if (photoCount >= 10) score += 15;
        else if (photoCount >= 5) score += 10;
        else if (photoCount >= 1) score += 5;

        // Video (20 points)
        if (data.videos && data.videos.length > 0) score += 20;

        // Virtual tour (15 points)
        if (data.virtual_tour_url) score += 15;

        // Description (20 points)
        const descLength = data.description?.length || 0;
        if (descLength >= 200) score += 20;
        else if (descLength >= 100) score += 15;
        else if (descLength >= 50) score += 10;
        else if (descLength >= 20) score += 5;

        // Amenities (5 points)
        const amenityCount = data.amenities?.length || 0;
        if (amenityCount >= 5) score += 5;
        else if (amenityCount >= 3) score += 3;
        else if (amenityCount >= 1) score += 1;

        setHealthScore(score);

        // TODO: Call API to get detailed breakdown
        // const breakdown = await fetch('/api/properties/health-score', {...})
    };

    // Validate current step
    const validateCurrentStep = (): boolean => {
        const step = STEPS[currentStep - 1];

        // Skip validation for optional steps
        if (step.optional) return true;

        // Step-specific validation
        switch (currentStep) {
            case 1: // Basic Info
                return !!(
                    formData.property_type &&
                    formData.operation_type &&
                    formData.title &&
                    (formData.sale_price || formData.rent_price)
                );

            case 2: // Location
                return !!(formData.address?.city && formData.address?.state);

            case 3: // Features
                return !!(formData.bedrooms || formData.construction_m2);

            case 7: // Review
                return formData.confirm_publish === true;

            default:
                return true;
        }
    };

    // Navigation
    const goToStep = (step: number) => {
        if (step >= 1 && step <= STEPS.length) {
            setCurrentStep(step);
        }
    };

    const goNext = () => {
        if (validateCurrentStep()) {
            if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const goPrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Save as draft
    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            await onSave?.(formData as PropertyWizardData, true);
            // Show success toast
        } catch (error) {
            console.error('Error saving draft:', error);
            // Show error toast
        } finally {
            setIsSaving(false);
        }
    };

    // Publish property
    const handlePublish = async () => {
        if (healthScore < 60) {
            alert('El health score debe ser de al menos 60% para publicar.');
            return;
        }

        setIsPublishing(true);
        try {
            await onPublish?.(formData as PropertyWizardData);
            // Show success and redirect
        } catch (error) {
            console.error('Error publishing property:', error);
            // Show error toast
        } finally {
            setIsPublishing(false);
        }
    };

    // Get current step component
    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {propertyId ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].title}
                    </p>
                </div>

                {/* Health Score Badge */}
                <PropertyHealthScore
                    score={healthScore}
                    breakdown={healthBreakdown}
                    size="sm"
                />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    {STEPS.map((step) => (
                        <button
                            key={step.number}
                            onClick={() => goToStep(step.number)}
                            className={`flex flex-col items-center gap-1 transition-colors ${currentStep === step.number
                                    ? 'text-primary font-semibold'
                                    : completedSteps.has(step.number)
                                        ? 'text-green-600'
                                        : 'hover:text-foreground'
                                }`}
                            disabled={step.number > currentStep + 1}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === step.number
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : completedSteps.has(step.number)
                                        ? 'border-green-600 bg-green-50 text-green-600'
                                        : 'border-muted bg-background'
                                }`}>
                                {completedSteps.has(step.number) ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span className="hidden md:block max-w-20 text-center">
                                {step.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <Card className="p-6">
                <CurrentStepComponent
                    data={formData}
                    onChange={updateStepData}
                    healthScore={healthScore}
                />
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={goPrevious}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Borrador'}
                    </Button>
                </div>

                <div className="flex gap-2">
                    {currentStep < STEPS.length ? (
                        <Button
                            onClick={goNext}
                            disabled={!validateCurrentStep()}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || healthScore < 60}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPublishing ? 'Publicando...' : 'Publicar Propiedad'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Optional Steps Notice */}
            {STEPS[currentStep - 1].optional && (
                <p className="text-sm text-muted-foreground text-center">
                    ℹ️ Este paso es opcional. Puedes omitirlo si lo deseas.
                </p>
            )}
        </div>
    );
}
