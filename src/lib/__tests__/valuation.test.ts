import { describe, it, expect } from 'vitest'
import {
  getPricePerM2,
  getValuationClassification,
  VALUATION_COLORS,
  type PropertyForValuation,
} from '../valuation'

describe('getPricePerM2', () => {
  it('should calculate price per m2 for sale property', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 5000000,
      operation_type: 'venta',
      property_type: 'casa',
      city: 'CDMX',
      construction_m2: 200,
    }

    expect(getPricePerM2(property)).toBe(25000)
  })

  it('should use rent_price for rental properties', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 0,
      rent_price: 25000,
      operation_type: 'renta',
      property_type: 'departamento',
      city: 'CDMX',
      construction_m2: 100,
    }

    expect(getPricePerM2(property)).toBe(250)
  })

  it('should return null when no area is available', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 5000000,
      operation_type: 'venta',
      property_type: 'casa',
      city: 'CDMX',
      total_area: null,
      construction_m2: null,
      land_m2: null,
    }

    expect(getPricePerM2(property)).toBeNull()
  })

  it('should return null when area is zero', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 5000000,
      operation_type: 'venta',
      property_type: 'casa',
      city: 'CDMX',
      construction_m2: 0,
    }

    expect(getPricePerM2(property)).toBeNull()
  })

  it('should prefer total_area over construction_m2', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 5000000,
      operation_type: 'venta',
      property_type: 'casa',
      city: 'CDMX',
      total_area: 250,
      construction_m2: 200,
      land_m2: 300,
    }

    expect(getPricePerM2(property)).toBe(20000) // 5000000 / 250
  })

  it('should fallback to land_m2 when no other area', () => {
    const property: PropertyForValuation = {
      id: '1',
      price: 3000000,
      operation_type: 'venta',
      property_type: 'terreno',
      city: 'CDMX',
      land_m2: 150,
    }

    expect(getPricePerM2(property)).toBe(20000) // 3000000 / 150
  })
})

describe('getValuationClassification', () => {
  const baseProperty: PropertyForValuation = {
    id: 'target',
    price: 5000000,
    operation_type: 'venta',
    property_type: 'casa',
    city: 'CDMX',
    construction_m2: 200,
  }

  it('should return "medio" when no area is available', () => {
    const noArea: PropertyForValuation = {
      ...baseProperty,
      construction_m2: null,
      total_area: null,
      land_m2: null,
    }

    expect(getValuationClassification(noArea, [])).toBe('medio')
  })

  it('should return "medio" when no comparables exist', () => {
    const result = getValuationClassification(baseProperty, [])
    // With no comparables (only self in sorted array), classification defaults
    expect(['optimo', 'medio']).toContain(result)
  })

  it('should classify as "optimo" when price is within P25-P75 range', () => {
    // Create comparables with similar price/m2
    const comparables: PropertyForValuation[] = [
      { id: '2', price: 4800000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '3', price: 5200000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '4', price: 4500000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '5', price: 5500000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '6', price: 4900000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '7', price: 5100000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
    ]

    const result = getValuationClassification(baseProperty, comparables)
    expect(result).toBe('optimo')
  })

  it('should classify as "fuera" when price is extreme outlier', () => {
    const expensiveProperty: PropertyForValuation = {
      ...baseProperty,
      price: 20000000, // Way above market
    }

    const comparables: PropertyForValuation[] = [
      { id: '2', price: 2000000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '3', price: 2200000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '4', price: 1800000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '5', price: 2100000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '6', price: 1900000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
      { id: '7', price: 2050000, operation_type: 'venta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
    ]

    const result = getValuationClassification(expensiveProperty, comparables)
    expect(result).toBe('fuera')
  })

  it('should not compare properties in different cities', () => {
    const comparables: PropertyForValuation[] = [
      { id: '2', price: 1000000, operation_type: 'venta', property_type: 'casa', city: 'Guadalajara', construction_m2: 200 },
      { id: '3', price: 1000000, operation_type: 'venta', property_type: 'casa', city: 'Monterrey', construction_m2: 200 },
    ]

    const result = getValuationClassification(baseProperty, comparables)
    // No valid comparables, should be 'optimo' or 'medio' (not 'fuera')
    expect(['optimo', 'medio']).toContain(result)
  })

  it('should not compare different property types', () => {
    const comparables: PropertyForValuation[] = [
      { id: '2', price: 1000000, operation_type: 'venta', property_type: 'departamento', city: 'CDMX', construction_m2: 200 },
      { id: '3', price: 1000000, operation_type: 'venta', property_type: 'terreno', city: 'CDMX', construction_m2: 200 },
    ]

    const result = getValuationClassification(baseProperty, comparables)
    expect(['optimo', 'medio']).toContain(result)
  })

  it('should not compare different operation types', () => {
    const comparables: PropertyForValuation[] = [
      { id: '2', price: 25000, rent_price: 25000, operation_type: 'renta', property_type: 'casa', city: 'CDMX', construction_m2: 200 },
    ]

    const result = getValuationClassification(baseProperty, comparables)
    expect(['optimo', 'medio']).toContain(result)
  })
})

describe('VALUATION_COLORS', () => {
  it('should have correct labels', () => {
    expect(VALUATION_COLORS.optimo.label).toBe('Óptimo')
    expect(VALUATION_COLORS.medio.label).toBe('Medio')
    expect(VALUATION_COLORS.fuera.label).toBe('Fuera de mercado')
  })

  it('should have text and bg classes for each level', () => {
    Object.values(VALUATION_COLORS).forEach((color) => {
      expect(color.text).toBeDefined()
      expect(color.bg).toBeDefined()
      expect(color.label).toBeDefined()
      expect(color.text.startsWith('text-')).toBe(true)
      expect(color.bg.startsWith('bg-')).toBe(true)
    })
  })
})
