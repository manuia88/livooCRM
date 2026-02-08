'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ImageUploadProps {
    propertyId: string
    maxFiles?: number
    onUploadComplete?: (images: any[]) => void
}

interface UploadingFile {
    id: string
    file: File
    preview: string
    progress: number
    status: 'uploading' | 'processing' | 'complete' | 'error'
    error?: string
    result?: any
}

export default function ImageUpload({
    propertyId,
    maxFiles = 10,
    onUploadComplete
}: ImageUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            uploadingFiles.forEach(f => URL.revokeObjectURL(f.preview))
        }
    }, [])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const currentCount = uploadingFiles.filter(f => f.status !== 'error').length
        const filesToUpload = acceptedFiles.slice(0, maxFiles - currentCount)

        if (filesToUpload.length === 0) return

        const newFiles: UploadingFile[] = filesToUpload.map(file => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'uploading'
        }))

        setUploadingFiles(prev => [...prev, ...newFiles])

        // Process each file
        for (const fileData of newFiles) {
            try {
                // 1. Upload original to temp storage
                const fileName = `temp/${crypto.randomUUID()}-${fileData.file.name}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, fileData.file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName)

                setUploadingFiles(prev => prev.map(f =>
                    f.id === fileData.id ? { ...f, progress: 50, status: 'processing' } : f
                ))

                // 2. Call Edge Function to optimize
                // Use environment variables or relative path if possible
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/optimize-image`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            imageUrl: publicUrl,
                            propertyId: propertyId,
                            isPrimary: false, // Default to false, can be changed later
                            altText: fileData.file.name
                        })
                    }
                )

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || 'Optimization failed')
                }

                // 3. Delete temp file
                await supabase.storage
                    .from('property-images')
                    .remove([fileName])

                setUploadingFiles(prev => {
                    const updated = prev.map(f =>
                        f.id === fileData.id ? { ...f, progress: 100, status: 'complete' as const, result: result.image } : f
                    )

                    // Notify complete if all are done
                    const allFinished = updated.every(f => f.status === 'complete' || f.status === 'error')
                    if (allFinished && onUploadComplete) {
                        const completed = updated.filter(f => f.status === 'complete').map(f => f.result)
                        onUploadComplete(completed)
                    }

                    return updated
                })

            } catch (error: any) {
                console.error('Upload error:', error)
                setUploadingFiles(prev => prev.map(f =>
                    f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
                ))
            }
        }
    }, [propertyId, uploadingFiles, maxFiles, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp']
        },
        maxFiles: maxFiles - uploadingFiles.length,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: uploadingFiles.length >= maxFiles
    })

    function removeFile(id: string) {
        setUploadingFiles(prev => {
            const file = prev.find(f => f.id === id)
            if (file) URL.revokeObjectURL(file.preview)
            return prev.filter(f => f.id !== id)
        })
    }

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
          flex flex-col items-center justify-center text-center gap-3
          ${isDragActive ? 'border-[#B8975A] bg-[#FAF8F3]' : 'border-gray-200 hover:border-[#B8975A] hover:bg-gray-50'}
          ${uploadingFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Upload className="w-6 h-6" />
                </div>

                {isDragActive ? (
                    <p className="text-[#B8975A] font-semibold">Suelta las imágenes aquí...</p>
                ) : (
                    <>
                        <div>
                            <p className="text-gray-900 font-semibold text-lg">
                                Arrastra imágenes aquí o haz clic para seleccionar
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                JPG, PNG o WebP (máx. 10MB por imagen)
                            </p>
                        </div>
                        <div className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
                            {uploadingFiles.length} / {maxFiles} imágenes
                        </div>
                    </>
                )}
            </div>

            {/* Lista de archivos subiendo */}
            {uploadingFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {uploadingFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm group"
                        >
                            {/* Preview */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                                <img
                                    src={file.preview}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-gray-900 truncate pr-4">
                                        {file.file.name}
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-400 tabular-nums">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>

                                {/* Progress bar */}
                                {(file.status === 'uploading' || file.status === 'processing') && (
                                    <div className="space-y-1.5">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#B8975A] transition-all duration-300 ease-out rounded-full"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-[#B8975A] uppercase tracking-wider">
                                            {file.status === 'uploading' ? 'Subiendo archivo...' : 'Optimizando imagen...'}
                                        </p>
                                    </div>
                                )}

                                {/* Error */}
                                {file.status === 'error' && (
                                    <div className="flex items-center gap-1.5 text-red-500">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <p className="text-xs font-bold">Error: {file.error}</p>
                                    </div>
                                )}

                                {/* Success Stats */}
                                {file.status === 'complete' && file.result && (
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <Check className="w-3.5 h-3.5" />
                                        <p className="text-xs font-bold">
                                            Optimizado: {((1 - file.result.compression_ratio) * 100).toFixed(0)}% ahorro
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-2">
                                {file.status === 'processing' && (
                                    <Loader2 className="w-5 h-5 text-[#B8975A] animate-spin" />
                                )}
                                {file.status === 'complete' && (
                                    <Check className="w-5 h-5 text-green-500" />
                                )}

                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
