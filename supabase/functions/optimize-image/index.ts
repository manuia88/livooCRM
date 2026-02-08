import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="https://esm.sh/v135/@types/sharp@0.32.0/index.d.ts"
import sharp from 'https://esm.sh/sharp@0.33.0'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface OptimizeRequest {
    imageUrl: string
    propertyId: string
    isPrimary?: boolean
    altText?: string
}

interface ImageVariant {
    name: string
    width: number
    height: number
    quality: number
}

const VARIANTS: ImageVariant[] = [
    { name: 'thumbnail', width: 300, height: 200, quality: 70 },
    { name: 'medium', width: 800, height: 600, quality: 80 },
    { name: 'large', width: 1920, height: 1080, quality: 85 }
]

serve(async (req) => {
    // Manejar CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { imageUrl, propertyId, isPrimary = false, altText }: OptimizeRequest = await req.json()

        console.log(`Processing image for property ${propertyId}`)

        // 1. Descargar imagen original
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const originalSize = imageBuffer.byteLength

        console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)

        // 2. Obtener metadata de la imagen
        const metadata = await sharp(imageBuffer).metadata()
        console.log(`Original dimensions: ${metadata.width}x${metadata.height}`)

        // 3. Procesar cada variante en paralelo
        const variantPromises = VARIANTS.map(async (variant) => {
            console.log(`Processing ${variant.name}...`)

            // Resize y convertir a WebP
            const processedBuffer = await sharp(imageBuffer)
                .resize(variant.width, variant.height, {
                    fit: 'cover', // Crop para mantener aspect ratio
                    position: 'center'
                })
                .webp({ quality: variant.quality })
                .toBuffer()

            const processedSize = processedBuffer.byteLength
            console.log(`${variant.name} size: ${(processedSize / 1024).toFixed(2)} KB`)

            // 4. Subir a Supabase Storage
            const fileName = `${propertyId}/${crypto.randomUUID()}-${variant.name}.webp`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(fileName, processedBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '31536000' // 1 año
                })

            if (uploadError) {
                console.error(`Upload error for ${variant.name}:`, uploadError)
                throw uploadError
            }

            // 5. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(fileName)

            return {
                variant: variant.name,
                url: publicUrl,
                size: processedSize
            }
        })

        const variants = await Promise.all(variantPromises)

        // 6. Calcular estadísticas
        const totalOptimizedSize = variants.reduce((sum, v) => sum + v.size, 0)
        const compressionRatio = totalOptimizedSize / originalSize

        console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`)

        // 7. Guardar en base de datos
        const { data: imageRecord, error: dbError } = await supabase
            .from('property_images')
            .insert({
                property_id: propertyId,
                original_url: imageUrl,
                original_size_bytes: originalSize,
                thumbnail_url: variants.find(v => v.variant === 'thumbnail')!.url,
                medium_url: variants.find(v => v.variant === 'medium')!.url,
                large_url: variants.find(v => v.variant === 'large')!.url,
                width: metadata.width,
                height: metadata.height,
                format: 'webp',
                optimized_size_bytes: totalOptimizedSize,
                compression_ratio: compressionRatio,
                is_primary: isPrimary,
                alt_text: altText || '',
                display_order: 0 // TODO: obtener max order + 1
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            throw dbError
        }

        return new Response(
            JSON.stringify({
                success: true,
                image: imageRecord,
                stats: {
                    originalSize: originalSize,
                    optimizedSize: totalOptimizedSize,
                    savedBytes: originalSize - totalOptimizedSize,
                    compressionRatio: compressionRatio,
                    variants: variants
                }
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                status: 200
            }
        )

    } catch (error) {
        console.error('Image optimization error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                status: 500
            }
        )
    }
})
