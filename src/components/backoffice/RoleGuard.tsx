// src/components/backoffice/RoleGuard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles?: ('admin' | 'director' | 'asesor')[]
    fallbackPath?: string
    loadingComponent?: React.ReactNode
}

/**
 * Componente para proteger rutas según el rol del usuario
 * 
 * @example
 * // Solo admins y directores
 * <RoleGuard allowedRoles={['admin', 'director']}>
 *   <AdminDashboard />
 * </RoleGuard>
 * 
 * @example
 * // Cualquier usuario autenticado
 * <RoleGuard>
 *   <Dashboard />
 * </RoleGuard>
 */
export function RoleGuard({
    children,
    allowedRoles,
    fallbackPath = '/backoffice',
    loadingComponent,
}: RoleGuardProps) {
    const router = useRouter()
    const { data: user, isLoading, error } = useCurrentUser()

    useEffect(() => {
        // Si hay error o no hay usuario, redirigir a login
        if (!isLoading && (error || !user)) {
            router.push('/login')
            return
        }

        // Si el usuario no está en los roles permitidos, redirigir
        if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
            router.push(fallbackPath)
        }
    }, [user, isLoading, error, allowedRoles, fallbackPath, router])

    // Mostrar loading
    if (isLoading) {
        if (loadingComponent) {
            return <>{loadingComponent}</>
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // Si no hay usuario, no mostrar nada (se redirigirá)
    if (!user) {
        return null
    }

    // Si hay roles permitidos y el usuario no está en la lista, no mostrar nada
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null
    }

    // Todo OK, mostrar contenido
    return <>{children}</>
}

/**
 * Componente específico para proteger rutas de Admin
 */
export function AdminGuard({
    children,
    fallbackPath = '/backoffice',
}: {
    children: React.ReactNode
    fallbackPath?: string
}) {
    return (
        <RoleGuard allowedRoles={['admin', 'director']} fallbackPath={fallbackPath}>
            {children}
        </RoleGuard>
    )
}

/**
 * Hook para verificar permisos desde componentes
 */
export function useHasRole(roles: ('admin' | 'director' | 'asesor')[]) {
    const { data: user } = useCurrentUser()

    if (!user) return false

    return roles.includes(user.role)
}

/**
 * Hook para verificar si es admin o director
 */
export function useIsAdminOrDirector() {
    return useHasRole(['admin', 'director'])
}
