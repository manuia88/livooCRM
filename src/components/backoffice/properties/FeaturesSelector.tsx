'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const AMENITIES = [
  'Alberca', 'Gym', 'Seguridad 24/7', 'Elevador', 'Estacionamiento Visitas',
  'Salón de Fiestas', 'Jardín', 'Roof Garden', 'Pet Friendly', 'Áreas Verdes'
]

const FEATURES = [
  'Cocina Integral', 'Closets', 'Aire Acondicionado', 'Calefacción', 'Balcón',
  'Terraza', 'Cuarto de Servicio', 'Bodega', 'Amueblado', 'Vista Panorámica'
]

interface FeaturesSelectorProps {
  amenities: string[]
  features: string[]
  onAmenitiesChange?: (amenities: string[]) => void
  onFeaturesChange?: (features: string[]) => void
  editable?: boolean
}

export function FeaturesSelector({
  amenities,
  features,
  onAmenitiesChange,
  onFeaturesChange,
  editable = false
}: FeaturesSelectorProps) {
  const toggleAmenity = (amenity: string) => {
    if (!onAmenitiesChange) return
    if (amenities.includes(amenity)) {
      onAmenitiesChange(amenities.filter(a => a !== amenity))
    } else {
      onAmenitiesChange([...amenities, amenity])
    }
  }

  const toggleFeature = (feature: string) => {
    if (!onFeaturesChange) return
    if (features.includes(feature)) {
      onFeaturesChange(features.filter(f => f !== feature))
    } else {
      onFeaturesChange([...features, feature])
    }
  }

  return (
    <div className="space-y-6">
      {/* Amenidades */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Amenidades</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES.map((amenity) => {
            const isSelected = amenities.includes(amenity)
            return (
              <button
                key={amenity}
                onClick={() => editable && toggleAmenity(amenity)}
                disabled={!editable}
                className={`
                  p-3 rounded-lg border-2 text-sm font-medium transition-colors
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }
                  ${editable ? 'cursor-pointer' : 'cursor-default'}
                  flex items-center justify-between
                `}
              >
                <span>{amenity}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Características */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Características</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((feature) => {
            const isSelected = features.includes(feature)
            return (
              <button
                key={feature}
                onClick={() => editable && toggleFeature(feature)}
                disabled={!editable}
                className={`
                  p-3 rounded-lg border-2 text-sm font-medium transition-colors
                  ${isSelected 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }
                  ${editable ? 'cursor-pointer' : 'cursor-default'}
                  flex items-center justify-between
                `}
              >
                <span>{feature}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
