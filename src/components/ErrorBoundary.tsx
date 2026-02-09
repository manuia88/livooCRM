'use client'

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack || undefined,
                },
            },
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex items-center justify-center min-h-[400px] p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Algo salió mal</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Ocurrió un error inesperado. Por favor, recarga la página o contacta a soporte si el problema persiste.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
