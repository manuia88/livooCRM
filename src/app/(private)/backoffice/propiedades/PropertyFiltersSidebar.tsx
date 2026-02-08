'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ESTATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Disponible' },
  { value: 'reserved', label: 'Reservada' },
  { value: 'sold', label: 'Vendida' },
  { value: 'rented', label: 'Rentada' },
  { value: 'suspended', label: 'No disponible' },
  { value: 'archived', label: 'Archivada' },
] as const

export interface AdvancedFiltersState {
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  constructionM2Min: number | null
  constructionM2Max: number | null
  landM2Min: number | null
  landM2Max: number | null
  status: string[]
}

export const INITIAL_ADVANCED: AdvancedFiltersState = {
  bedrooms: null,
  bathrooms: null,
  parkingSpaces: null,
  constructionM2Min: null,
  constructionM2Max: null,
  landM2Min: null,
  landM2Max: null,
  status: [],
}

interface PropertyFiltersSidebarProps {
  open: boolean
  onClose: () => void
  filters: AdvancedFiltersState
  onFiltersChange: (f: AdvancedFiltersState) => void
}

const COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function PropertyFiltersSidebar({
  open,
  onClose,
  filters,
  onFiltersChange,
}: PropertyFiltersSidebarProps) {
  const [statusSearch, setStatusSearch] = useState('')
  const update = (key: keyof AdvancedFiltersState, value: AdvancedFiltersState[keyof AdvancedFiltersState]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const filteredStatusOptions = useMemo(
    () =>
      statusSearch.trim()
        ? ESTATUS_OPTIONS.filter((opt) =>
          opt.label.toLowerCase().includes(statusSearch.toLowerCase())
        )
        : ESTATUS_OPTIONS,
    [statusSearch]
  )

  const toggleStatus = (value: string) => {
    const next = filters.status.includes(value)
      ? filters.status.filter((s) => s !== value)
      : [...filters.status, value]
    update('status', next)
  }

  const clearAll = () => {
    onFiltersChange(INITIAL_ADVANCED)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-l border-gray-200 transition-transform duration-300 ease-out flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Filtros avanzados</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Recámaras */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Recámaras</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('bedrooms', null)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filters.bedrooms === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Cualquiera
              </button>
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('bedrooms', n)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    filters.bedrooms === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          {/* Baños */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Baños</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('bathrooms', null)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filters.bathrooms === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Cualquiera
              </button>
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('bathrooms', n)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    filters.bathrooms === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          {/* Estacionamientos */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Estacionamientos</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('parkingSpaces', null)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filters.parkingSpaces === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Cualquiera
              </button>
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('parkingSpaces', n)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    filters.parkingSpaces === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          {/* Metros construidos */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Metros construidos (m²)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.constructionM2Min ?? ''}
                  onChange={(e) => update('constructionM2Min', e.target.value ? Number(e.target.value) : null)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Máximo</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="—"
                  value={filters.constructionM2Max ?? ''}
                  onChange={(e) => update('constructionM2Max', e.target.value ? Number(e.target.value) : null)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
          </div>

          {/* Metros de terreno */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Metros de terreno (m²)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.landM2Min ?? ''}
                  onChange={(e) => update('landM2Min', e.target.value ? Number(e.target.value) : null)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Máximo</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="—"
                  value={filters.landM2Max ?? ''}
                  onChange={(e) => update('landM2Max', e.target.value ? Number(e.target.value) : null)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
          </div>

          {/* Estatus */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Estatus de la propiedad</Label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estatus..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-2">
              {filteredStatusOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={filters.status.includes(opt.value)}
                    onCheckedChange={() => toggleStatus(opt.value)}
                    className="rounded-md"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </label>
              ))}
              {filteredStatusOptions.length === 0 && (
                <p className="text-sm text-gray-500 py-2">Ningún estatus coincide.</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold shadow-sm"
          >
            Aplicar
          </Button>
          <Button variant="outline" onClick={clearAll} className="flex-1 rounded-xl">
            Limpiar filtros
          </Button>
        </div>
      </div>
    </>
  )
}
