'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Upload, Trash2 } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  onImagesChange?: (images: string[]) => void
  editable?: boolean
}

export function ImageGallery({ images, onImagesChange, editable = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleAddImage = () => {
    const newImageUrl = prompt('Ingresa la URL de la imagen:')
    if (newImageUrl && onImagesChange) {
      onImagesChange([...images, newImageUrl])
    }
  }

  const handleRemoveImage = (index: number) => {
    if (onImagesChange) {
      onImagesChange(images.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedImage(imageUrl)}
              />
            </div>
            {editable && (
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {editable && (
          <button
            onClick={handleAddImage}
            className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Agregar</span>
          </button>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 text-white" onClick={() => setSelectedImage(null)}>
            <X className="h-8 w-8" />
          </button>
          <Image src={selectedImage} alt="Vista completa" width={1200} height={800} className="object-contain" />
        </div>
      )}
    </div>
  )
}
