
'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePropertyFormStore } from '@/stores/usePropertyFormStore';

const steps = [
    { id: 1, name: 'Información Básica' },
    { id: 2, name: 'Ubicación' },
    { id: 3, name: 'Características' },
    { id: 4, name: 'Amenidades' },
    { id: 5, name: 'Multimedia' },
    { id: 6, name: 'MLS & Colaboración' },
    { id: 7, name: 'Propietario' },
];

export function PropertyFormStepper() {
    const { currentStep } = usePropertyFormStore();

    return (
        <div className="w-full py-4 px-4 sm:px-0">
            <nav aria-label="Progress">
                <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200">
                    {steps.map((step, stepIdx) => (
                        <li key={step.id} className="relative overflow-hidden lg:flex-1">
                            <div
                                className={cn(
                                    stepIdx === 0 ? 'border-b-0 rounded-t-md border-r-0' : '',
                                    stepIdx === steps.length - 1 ? 'border-b-0 rounded-b-md border-l-0' : '',
                                    'overflow-hidden border border-gray-200 lg:border-0'
                                )}
                            >
                                {/* Complete Step */}
                                {currentStep > step.id ? (
                                    <div className="group">
                                        <span
                                            className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                            aria-hidden="true"
                                        />
                                        <span className="flex items-start px-6 py-5 text-sm font-medium">
                                            <span className="flex-shrink-0">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
                                                    <Check className="h-6 w-6 text-white" aria-hidden="true" />
                                                </span>
                                            </span>
                                            <div className="ml-4 mt-0.5 min-w-0 flex flex-col">
                                                <span className="text-xs font-semibold tracking-wide uppercase text-indigo-600">
                                                    Paso {step.id}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                                            </div>
                                        </span>
                                    </div>
                                ) : currentStep === step.id ? (
                                    /* Current Step */
                                    <div aria-current="step">
                                        <span
                                            className="absolute top-0 left-0 h-full w-1 bg-indigo-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                            aria-hidden="true"
                                        />
                                        <span className="flex items-start px-6 py-5 text-sm font-medium">
                                            <span className="flex-shrink-0">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-600">
                                                    <span className="text-indigo-600">{step.id}</span>
                                                </span>
                                            </span>
                                            <div className="ml-4 mt-0.5 min-w-0 flex flex-col">
                                                <span className="text-xs font-semibold tracking-wide uppercase text-indigo-600">
                                                    Paso {step.id}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                                            </div>
                                        </span>
                                    </div>
                                ) : (
                                    /* Upcoming Step */
                                    <div className="group">
                                        <span
                                            className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                            aria-hidden="true"
                                        />
                                        <span className="flex items-start px-6 py-5 text-sm font-medium">
                                            <span className="flex-shrink-0">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300">
                                                    <span className="text-gray-500">{step.id}</span>
                                                </span>
                                            </span>
                                            <div className="ml-4 mt-0.5 min-w-0 flex flex-col">
                                                <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                                                    Paso {step.id}
                                                </span>
                                                <span className="text-sm font-medium text-gray-500">{step.name}</span>
                                            </div>
                                        </span>
                                    </div>
                                )}

                                {/* Separator */}
                                {stepIdx !== steps.length - 1 ? (
                                    <>
                                        <div className="absolute top-0 right-0 hidden h-full w-5 md:block" aria-hidden="true">
                                            <svg
                                                className="h-full w-full text-gray-300"
                                                viewBox="0 0 22 80"
                                                fill="none"
                                                preserveAspectRatio="none"
                                            >
                                                <path
                                                    d="M0 -2L20 40L0 82"
                                                    vectorEffect="non-scaling-stroke"
                                                    stroke="currentcolor"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
}
