'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, ImageOff } from 'lucide-react'

interface PropertyImageProps {
    thumbnailUrl: string
    mediumUrl: string
    largeUrl: string
    alt: string
    priority?: boolean
    className?: string
    onClick?: () => void
}

export default function PropertyImage({
    thumbnailUrl,
    mediumUrl,
    largeUrl,
    alt,
    priority = false,
    className = '',
    onClick
}: PropertyImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // Usar thumbnail por defecto, medium en hover si es interactivo
    const [currentSrc, setCurrentSrc] = useState(thumbnailUrl)

    return (
        <div
            className={`relative overflow-hidden bg-gray-100 ${className}`}
            onMouseEnter={() => onClick && setCurrentSrc(mediumUrl)}
            onMouseLeave={() => onClick && setCurrentSrc(thumbnailUrl)}
            onClick={onClick}
        >
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <ImageOff className="w-8 h-8 mb-2" />
                    <span className="text-xs">Error al cargar imagen</span>
                </div>
            )}

            {/* Image */}
            <Image
                src={currentSrc || thumbnailUrl}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`
          object-cover transition-all duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        `}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false)
                    setHasError(true)
                }}
            />
        </div>
    )
}
