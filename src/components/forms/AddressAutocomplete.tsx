'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface AddressResult {
    display_name: string
    lat: string
    lon: string
    address: {
        road?: string
        house_number?: string
        suburb?: string
        city?: string
        state?: string
        postcode?: string
        country?: string
    }
}

interface AddressAutocompleteProps {
    onAddressSelect: (address: string, coordinates: { lat: number; lng: number }, details: any) => void
    defaultValue?: string
    placeholder?: string
}

export default function AddressAutocomplete({
    onAddressSelect,
    defaultValue = '',
    placeholder = 'Buscar dirección...'
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue)
    const [results, setResults] = useState<AddressResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchAddress = async (val: string) => {
        if (val.length < 3) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5&countrycodes=mx`
            )
            const data = await response.json()
            setResults(data)
            setShowResults(true)
        } catch (error) {
            console.error('Error searching address:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            searchAddress(val)
        }, 500)
    }

    const handleSelect = (result: AddressResult) => {
        setQuery(result.display_name)
        setShowResults(false)
        onAddressSelect(
            result.display_name,
            { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
            result.address
        )
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Input
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    onFocus={() => query.length >= 3 && setShowResults(true)}
                    className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </div>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((result, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(result)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                        >
                            <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{result.display_name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
