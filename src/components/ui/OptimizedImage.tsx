'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Loader2 } from '@/components/icons'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    className?: string
    priority?: boolean
    sizes?: string
}

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill,
    className,
    priority = false,
    sizes
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}

            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                fill={fill}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                quality={85}
                onLoad={() => setIsLoading(false)}
                sizes={sizes}
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                    } ${fill ? 'object-cover' : ''}`}
            />
        </div>
    )
}
