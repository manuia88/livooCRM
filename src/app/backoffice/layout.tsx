'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Home,
  Users,
  CheckSquare,
  Search,
  FileText,
  Inbox,
  BarChart3,
  Package,
  Activity,
  FileBarChart,
  Megaphone,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  X
} from 'lucide-react'
import { useCurrentUser, useIsAdmin } from '@/hooks/useCurrentUser'

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BackofficeContent>{children}</BackofficeContent>
}

function BackofficeContent({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* useEffect handled redirect - DEBE estar ANTES de cualquier return */
  useEffect(() => {
    if (!isLoading && !currentUser) {
      console.log('Usuario no autenticado, redirigiendo a /auth')
      router.push('/auth')
    }
  }, [currentUser, isLoading, router])

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando backoffice...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo a inicio de sesión...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    // Grupo Primario
    { href: '/backoffice', icon: LayoutDashboard, label: 'Inicio' },
    { href: '/backoffice/propiedades', icon: Home, label: 'Propiedades' },
    { href: '/backoffice/contactos', icon: Users, label: 'Contactos', divider: true },
    
    // Grupo Operativo
    { href: '/backoffice/busquedas', icon: Search, label: 'Búsquedas' },
    { href: '/backoffice/captaciones', icon: FileText, label: 'Captaciones' },
    { href: '/backoffice/tareas', icon: CheckSquare, label: 'Tareas', divider: true },
    
    // Sección Activa
    { href: '/backoffice/inventario', icon: Package, label: 'Inventario', active: true, divider: true },
    
    // Grupo Estratégico
    { href: '/backoffice/inbox', icon: Inbox, label: 'Operaciones' },
    { href: '/backoffice/marketing', icon: Megaphone, label: 'Marketing' },
    { href: '/backoffice/analytics', icon: BarChart3, label: 'Estadísticas' },
    { href: '/backoffice/actividad', icon: Activity, label: 'Academia' },
  ]

  // Add Usuarios only for admins
  if (isAdmin) {
    menuItems.push({
      href: '/backoffice/usuarios',
      icon: Settings,
      label: 'Usuarios'
    })
  }

  const isCrmDesignPage = pathname?.includes('/propiedades/nueva')
  return (
    <div
      className="flex h-screen relative"
      style={isCrmDesignPage ? { backgroundColor: '#F5F5F7' } : undefined}
    >
      {!isCrmDesignPage && <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" aria-hidden />}
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-xl shadow-2xl hover:bg-gray-800 transition-all duration-300"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Estilo Apple */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white/95 lg:bg-white/80 backdrop-blur-xl border-r border-gray-200/50 
        flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-6 border-b border-gray-200/50">
          <Link href="/backoffice" className="flex items-center space-x-3 transition-transform hover:scale-105 duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">L</span>
            </div>
            <span className="text-2xl font-black text-gray-900">LIVOO</span>
          </Link>
        </div>

        {/* Navigation - Estilo Apple */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isInventory = item.label === 'Inventario'

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-300 mb-1
                    ${isInventory
                      ? 'bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-gray-800 hover:scale-105'
                      : isActive
                      ? 'bg-gray-200/60 text-gray-900 rounded-2xl shadow-md'
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 rounded-2xl hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isInventory ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </Link>
                {item.divider && <div className="my-3 border-t border-gray-200/50" />}
              </div>
            )
          })}
        </nav>

        {/* Footer - Estilo Apple */}
        <div className="border-t border-gray-200/50 px-3 pb-3">
          <button className="w-full px-4 py-3 text-left text-sm text-gray-600 hover:bg-gray-100/60 rounded-2xl flex items-center space-x-3 transition-all duration-300 hover:shadow-sm mb-2">
            <HelpCircle className="h-5 w-5" />
            <span className="font-medium">¿Necesitas ayuda?</span>
          </button>

          {/* User Profile Card - Estilo Apple */}
          <div className="px-4 py-4 bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-black shadow-lg">
                  {currentUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {currentUser.full_name}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-600 font-medium">Disponible</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // TODO: Implement logout
                  alert('Logout pendiente de implementar')
                }}
                className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-white/50 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - min-w-0 para que el contenido no desborde y corte las tarjetas */}
      <main className="flex-1 min-w-0 overflow-auto w-full">
        {children}
      </main>
    </div>
  )
}
