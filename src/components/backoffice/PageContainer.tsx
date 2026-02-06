/**
 * PageContainer - Contenedor con estilo Apple para páginas del backoffice
 * 
 * Características:
 * - Fondo degradado
 * - Cards con backdrop-blur y sombras
 * - Diseño responsive
 * - Header consistente
 */

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface PageContainerProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
  variant?: 'default' | 'livoo' | 'crm'
}

export function PageContainer({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  variant = 'default',
}: PageContainerProps) {
  const isLivoo = variant === 'livoo'
  const isCrm = variant === 'crm'
  const bgClass = isCrm ? 'min-h-screen' : isLivoo ? 'min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#F2F0E9] to-[#E8E6E0]' : 'min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'
  return (
    <div className={bgClass} style={isCrm ? { backgroundColor: '#F5F5F7' } : undefined}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
        {/* Header — CRM: Design System (título 20–22px bold #111827, subtitle #6B7280, icon badge 42px) */}
        {(title || actions) && (
          <div className={isCrm ? 'mb-8' : 'mb-6 sm:mb-8'}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                {Icon &&
                  (isCrm ? (
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#3B82F6' }}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                  ) : (
                    <div
                      className={`p-3 rounded-2xl shadow-lg flex-shrink-0 ${isLivoo ? 'bg-[#2C3E2C]' : 'bg-gradient-to-br from-gray-900 to-gray-700'}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  ))}
                <div className="flex flex-col min-w-0">
                  {title && (
                    <h1
                      className={
                        isCrm
                          ? 'text-[20px] sm:text-[22px] font-bold text-[#111827] leading-tight'
                          : `text-2xl sm:text-3xl lg:text-4xl font-black ${isLivoo ? 'text-[#2C3E2C]' : 'text-gray-900'}`
                      }
                    >
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p
                      className={
                        isCrm
                          ? 'text-[13px] sm:text-[14px] text-[#6B7280] mt-0.5 leading-snug'
                          : `text-sm sm:text-base mt-1 ${isLivoo ? 'text-[#6B7B6B]' : 'text-gray-600'}`
                      }
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={className}>{children}</div>
      </div>
    </div>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
        shadow-2xl border border-gray-200 
        ${hover ? 'hover:scale-[1.02] transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-4 sm:px-6 py-4 sm:py-5 ${className}`}>{children}</div>
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg sm:text-xl font-bold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary:
      'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-md hover:shadow-lg',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
    success:
      'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base',
    lg: 'px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl sm:rounded-2xl font-semibold
        transition-all duration-200 hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  )
}
