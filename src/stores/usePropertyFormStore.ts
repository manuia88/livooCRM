
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PropertyFormValues } from '@/lib/validations/property';

interface PropertyFormState {
    currentStep: number;
    totalSteps: number;
    formData: Partial<PropertyFormValues>;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateFormData: (data: Partial<PropertyFormValues>) => void;
    resetForm: () => void;
}

const initialState: Partial<PropertyFormValues> = {
    status: 'draft',
    currency: 'MXN',
    amenities: [],
    photos: [], // Note: photos in Zod schema might need adjustment if we handle Files here
    shared_in_mls: false,
    is_exclusive: false,
    show_exact_location: false,
};

export const usePropertyFormStore = create<PropertyFormState>()(
    persist(
        (set) => ({
            currentStep: 1,
            totalSteps: 7,
            formData: initialState,

            setStep: (step) => set({ currentStep: step }),

            nextStep: () => set((state) => ({
                currentStep: Math.min(state.currentStep + 1, state.totalSteps)
            })),

            prevStep: () => set((state) => ({
                currentStep: Math.max(state.currentStep - 1, 1)
            })),

            updateFormData: (data) => set((state) => ({
                formData: { ...state.formData, ...data }
            })),

            resetForm: () => set({
                currentStep: 1,
                formData: initialState
            }),
        }),
        {
            name: 'property-form-storage',
            // Only persist specific relevant parts if needed, or exclude sensitive/large data
            // For now, persisting everything to recover from refresh is good.
        }
    )
);
