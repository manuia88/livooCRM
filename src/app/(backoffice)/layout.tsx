// src/app/(backoffice)/layout.tsx
'use client'

import { RoleGuard } from '@/components/backoffice/RoleGuard'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  CheckSquare,
  Search,
  GraduationCap,
  MessageCircle,
  BarChart3,
  Package,
  Activity,
  FileText,
  Megaphone,
  UsersRound,
  HelpCircle,
  LogOut
} from 'lucide-react'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  icon: any
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/backoffice', icon: LayoutDashboard },
  { label: 'Propiedades', href: '/backoffice/propiedades', icon: Home },
  { label: 'Contactos', href: '/backoffice/contactos', icon: Users },
  { label: 'Tareas', href: '/backoffice/tareas', icon: CheckSquare },
  { label: 'Búsquedas', href: '/backoffice/busquedas', icon: Search },
  { label: 'Captaciones', href: '/backoffice/captaciones', icon: GraduationCap },
  { label: 'Inbox', href: '/backoffice/inbox', icon: MessageCircle },
  { label: 'Analytics', href: '/backoffice/analytics', icon: BarChart3 },
  { label: 'Inventario', href: '/backoffice/inventario', icon: Package },
  { label: 'Actividad', href: '/backoffice/actividad', icon: Activity },
  { label: 'Reportes', href: '/backoffice/reportes', icon: FileText },
  { label: 'Marketing', href: '/backoffice/marketing', icon: Megaphone },
  { label: 'Usuarios', href: '/backoffice/usuarios', icon: UsersRound, adminOnly: true },
]

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard>
      <BackofficeLayoutContent>{children}</BackofficeLayoutContent>
    </RoleGuard>
  )
}

function BackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user } = useCurrentUser()

  const isAdmin = user?.role === 'admin' || user?.role === 'director'

  const handleLogout = async () => {
    // TODO: Implementar logout
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LIVOO</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            // Si es solo para admin y el usuario no es admin, no mostrar
            if (item.adminOnly && !isAdmin) return null

            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-sm
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Help */}
        <div className="border-t border-gray-200 p-4">
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>¿Necesitas ayuda?</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'Usuario'}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Disponible</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
