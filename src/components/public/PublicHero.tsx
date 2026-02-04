"use client";

import { ReactNode } from "react";
import { LucideIcon, Home, Building2, Calculator, Users, Mail, FileText, KeyRound, Search, Landmark, BookOpen, HelpCircle } from "lucide-react";
import Image from "next/image";

/** Nombres de iconos permitidos para uso desde Server Components (serializables) */
export type PublicHeroIconName = "Home" | "Building2" | "Calculator" | "Users" | "Mail" | "FileText" | "KeyRound" | "Search" | "Landmark" | "BookOpen" | "HelpCircle";

const ICON_MAP: Record<PublicHeroIconName, LucideIcon> = {
  Home,
  Building2,
  Calculator,
  Users,
  Mail,
  FileText,
  KeyRound,
  Search,
  Landmark,
  BookOpen,
  HelpCircle,
};

/**
 * PublicHero - Misma línea visual que el backoffice (PageContainer)
 * Fondo degradado, icono en caja redondeada, título font-black, cards con backdrop-blur
 * Colores Livoo aplicados sobre la misma estructura.
 * Desde Server Components usar iconName (string). Desde Client Components se puede usar icon (componente).
 */
export interface PublicHeroProps {
  title: string;
  subtitle?: string;
  /** Icono por nombre (usar desde Server Components) */
  iconName?: PublicHeroIconName;
  /** Icono como componente (solo desde Client Components) */
  icon?: LucideIcon;
  badge?: string;
  /** Imagen de fondo opcional (full-bleed con overlay) */
  imageSrc?: string;
  imageAlt?: string;
  /** Contenido principal dentro de la card (ej. búsqueda, formulario) */
  children?: ReactNode;
  /** Acciones a la derecha del título (escritorio) */
  actions?: ReactNode;
  className?: string;
}

export function PublicHero({
  title,
  subtitle,
  iconName,
  icon: IconProp,
  badge,
  imageSrc,
  imageAlt = "Background",
  children,
  actions,
  className = "",
}: PublicHeroProps) {
  const hasImage = Boolean(imageSrc);
  const Icon = iconName ? ICON_MAP[iconName] : IconProp;

  return (
    <section
      className={`
        relative min-h-[70vh] flex flex-col justify-center overflow-hidden
        bg-gradient-to-br from-[#FAF8F3] via-[#F2F0E9] to-[#E8E5DC]
        ${hasImage ? "min-h-[85vh]" : "py-16 sm:py-20"}
        ${className}
      `}
    >
      {/* Optional background image */}
      {hasImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageSrc!}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E2C]/90 via-[#2C3E2C]/75 to-[#2C3E2C]/60" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        {/* Header - mismo patrón que PageContainer del backoffice */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className={`p-3 rounded-2xl shadow-lg flex-shrink-0 ${hasImage ? "bg-white/20 backdrop-blur-sm border border-white/30" : "bg-gradient-to-br from-[#2C3E2C] to-[#3F5140] border border-[#E5E3DB]/50"}`}>
                  <Icon className={`h-6 w-6 ${hasImage ? "text-white" : "text-white"}`} />
                </div>
              )}
              <div>
                {badge && (
                  <span className={`inline-block text-xs font-semibold uppercase tracking-wider mb-1 ${hasImage ? "text-[#D4C19C]" : "text-[#B8975A]"}`}>
                    {badge}
                  </span>
                )}
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight ${
                    hasImage ? "text-white" : "text-[#2C3E2C]"
                  }`}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className={`text-sm sm:text-base mt-1 max-w-2xl ${
                      hasImage ? "text-white/90" : "text-[#6B7B6B]"
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>

        {/* Content Card - mismo estilo que Card del backoffice */}
        {children && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E3DB] overflow-hidden max-w-4xl">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
