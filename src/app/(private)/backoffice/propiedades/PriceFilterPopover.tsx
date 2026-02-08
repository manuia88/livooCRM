'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRICE_MIN = 0
const PRICE_MAX = 50_000_000
const STEP = 500_000

function formatPrice(value: number) {
  if (value <= 0) return ''
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}

interface PriceFilterPopoverProps {
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  belowMarket: boolean
  onBelowMarketChange: (value: boolean) => void
  className?: string
}

export function PriceFilterPopover({
  priceRange,
  onPriceRangeChange,
  belowMarket,
  onBelowMarketChange,
  className,
}: PriceFilterPopoverProps) {
  const [open, setOpen] = useState(false)

  const label =
    priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX
      ? `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`
      : 'Precio'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-12 rounded-2xl border-gray-200 bg-white/90 min-w-[140px] justify-between', className)}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[320px] rounded-2xl border-gray-200 bg-white p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
      >
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-900">Rango de precio</Label>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={STEP}
            value={priceRange}
            onValueChange={(v) => onPriceRangeChange(v as [number, number])}
            className="py-4"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Precio mínimo</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={priceRange[0] > PRICE_MIN ? formatPrice(priceRange[0]) : ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  const n = v ? Math.min(Number(v), priceRange[1]) : PRICE_MIN
                  onPriceRangeChange([n, priceRange[1]])
                }}
                className="mt-1 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Precio máximo</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="—"
                value={priceRange[1] < PRICE_MAX ? formatPrice(priceRange[1]) : ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  const n = v ? Math.max(Number(v), priceRange[0]) : PRICE_MAX
                  onPriceRangeChange([priceRange[0], n])
                }}
                className="mt-1 rounded-xl border-gray-200"
              />
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={belowMarket}
              onChange={(e) => onBelowMarketChange(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              Precio por debajo del valor de mercado
            </span>
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
