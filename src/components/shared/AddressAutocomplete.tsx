'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useDebounce } from '@/hooks/use-debounce'

interface AddressAutocompleteProps {
    onSelect: (address: any) => void
    placeholder?: string
    className?: string
}

export function AddressAutocomplete({
    onSelect,
    placeholder = "Buscar dirección...",
    className
}: AddressAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const debouncedQuery = useDebounce(query, 500)

    React.useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 3) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch(`/api/geocoding?action=search&query=${encodeURIComponent(debouncedQuery)}&limit=5`)
                const data = await response.json()
                setResults(data.results || [])
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        search()
    }, [debouncedQuery])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {value ? value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Escribe para buscar..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>}
                        {!isLoading && results.length === 0 && query.length >= 3 && (
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {results.map((result, index) => (
                                <CommandItem
                                    key={index}
                                    value={result.display_name}
                                    onSelect={() => {
                                        setValue(result.display_name)
                                        setOpen(false)
                                        onSelect(result)
                                    }}
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span className="truncate">{result.display_name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
