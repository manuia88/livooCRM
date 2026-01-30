
'use client';

import { usePropertyFormStore } from '@/stores/usePropertyFormStore';
import { PropertyFormStepper } from '@/components/properties/PropertyFormStepper';
import { BasicInfoStep } from '@/components/properties/steps/BasicInfoStep';
import { LocationStep } from '@/components/properties/steps/LocationStep';
import { FeaturesStep } from '@/components/properties/steps/FeaturesStep';
import { AmenitiesStep } from '@/components/properties/steps/AmenitiesStep';
import { MultimediaStep } from '@/components/properties/steps/MultimediaStep';
import { MlsStep } from '@/components/properties/steps/MlsStep';
import { OwnerStep } from '@/components/properties/steps/OwnerStep';

export default function NewPropertyPage() {
    const { currentStep } = usePropertyFormStore();

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <BasicInfoStep />;
            case 2:
                return <LocationStep />;
            case 3:
                return <FeaturesStep />;
            case 4:
                return <AmenitiesStep />;
            case 5:
                return <MultimediaStep />;
            case 6:
                return <MlsStep />;
            case 7:
                return <OwnerStep />;
            default:
                return <BasicInfoStep />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                        Nueva Propiedad
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Completa la información para publicar una nueva propiedad en el sistema.
                    </p>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <PropertyFormStepper />
                    <div className="px-4 py-6 sm:p-8">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );
}
