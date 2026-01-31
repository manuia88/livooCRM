'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  HelpCircle
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!currentUser) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  const menuItems = [
    { href: '/backoffice', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/backoffice/propiedades', icon: Home, label: 'Propiedades' },
    { href: '/backoffice/contactos', icon: Users, label: 'Contactos' },
    { href: '/backoffice/tareas', icon: CheckSquare, label: 'Tareas' },
    { href: '/backoffice/busquedas', icon: Search, label: 'Búsquedas', divider: true },
    { href: '/backoffice/captaciones', icon: FileText, label: 'Captaciones' },
    { href: '/backoffice/inbox', icon: Inbox, label: 'Inbox' },
    { href: '/backoffice/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/backoffice/inventario', icon: Package, label: 'Inventario' },
    { href: '/backoffice/actividad', icon: Activity, label: 'Actividad', divider: true },
    { href: '/backoffice/reportes', icon: FileBarChart, label: 'Reportes' },
    { href: '/backoffice/marketing', icon: Megaphone, label: 'Marketing' },
  ]

  // Add Usuarios only for admins
  if (isAdmin) {
    menuItems.push({ 
      href: '/backoffice/usuarios', 
      icon: Settings, 
      label: 'Usuarios' 
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/backoffice" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LIVOO</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
                {item.divider && <div className="my-2 border-t border-gray-200" />}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200">
          <button className="w-full px-6 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>¿Necesitas ayuda?</span>
          </button>

          {/* User Profile */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                {currentUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.full_name}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-gray-500">Disponible</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // TODO: Implement logout
                  alert('Logout pendiente de implementar')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
