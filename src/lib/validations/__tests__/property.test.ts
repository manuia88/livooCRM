import { describe, it, expect } from 'vitest'
import { propertySchema, propertyAddressSchema, coordinatesSchema } from '../property'

describe('propertySchema', () => {
  const validProperty = {
    title: 'Casa en Polanco',
    property_type: 'house',
    operation_type: 'sale',
    address: {
      city: 'CDMX',
      neighborhood: 'Polanco',
    },
    amenities: [],
    features: {},
    photos: [],
    videos: [],
  }

  it('should validate a correct property', () => {
    const result = propertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
  })

  it('should reject title shorter than 5 characters', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      title: 'abc',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('5')
    }
  })

  it('should reject title longer than 150 characters', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      title: 'a'.repeat(151),
    })
    expect(result.success).toBe(false)
  })

  it('should validate all property types', () => {
    const validTypes = [
      'house', 'apartment', 'condo', 'townhouse', 'land',
      'commercial', 'office', 'warehouse', 'building', 'farm', 'development',
    ]

    validTypes.forEach((type) => {
      const result = propertySchema.safeParse({
        ...validProperty,
        property_type: type,
      })
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid property type', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      property_type: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('should validate all operation types', () => {
    const validOps = ['sale', 'rent', 'both']

    validOps.forEach((op) => {
      const result = propertySchema.safeParse({
        ...validProperty,
        operation_type: op,
      })
      expect(result.success).toBe(true)
    })
  })

  it('should default status to draft', () => {
    const result = propertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('draft')
    }
  })

  it('should validate all status values', () => {
    const statuses = ['draft', 'active', 'reserved', 'sold', 'rented', 'suspended', 'archived']

    statuses.forEach((status) => {
      const result = propertySchema.safeParse({
        ...validProperty,
        status,
      })
      expect(result.success).toBe(true)
    })
  })

  it('should reject negative bedrooms', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      bedrooms: -1,
    })
    expect(result.success).toBe(false)
  })

  it('should accept zero bedrooms', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      bedrooms: 0,
    })
    expect(result.success).toBe(true)
  })

  it('should reject year_built before 1800', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      year_built: 1799,
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid year_built', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      year_built: 2024,
    })
    expect(result.success).toBe(true)
  })

  it('should validate currency enum', () => {
    const mxn = propertySchema.safeParse({ ...validProperty, currency: 'MXN' })
    const usd = propertySchema.safeParse({ ...validProperty, currency: 'USD' })
    const invalid = propertySchema.safeParse({ ...validProperty, currency: 'EUR' })

    expect(mxn.success).toBe(true)
    expect(usd.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it('should default currency to MXN', () => {
    const result = propertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('MXN')
    }
  })

  it('should reject commission_percentage over 100', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      commission_percentage: 101,
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid commission_percentage', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      commission_percentage: 5,
    })
    expect(result.success).toBe(true)
  })

  it('should default boolean fields', () => {
    const result = propertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.show_exact_location).toBe(false)
      expect(result.data.shared_in_mls).toBe(false)
      expect(result.data.commission_shared).toBe(false)
      expect(result.data.is_exclusive).toBe(false)
    }
  })

  it('should accept valid virtual_tour_url', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      virtual_tour_url: 'https://tour.example.com/123',
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty string for virtual_tour_url', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      virtual_tour_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid virtual_tour_url', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      virtual_tour_url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('should validate all condition types', () => {
    const conditions = ['new', 'excellent', 'good', 'needs_repair', 'under_construction']

    conditions.forEach((condition) => {
      const result = propertySchema.safeParse({
        ...validProperty,
        condition,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('propertyAddressSchema', () => {
  it('should validate empty address', () => {
    const result = propertyAddressSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate full address', () => {
    const result = propertyAddressSchema.safeParse({
      street: 'Masaryk 123',
      neighborhood: 'Polanco',
      city: 'Ciudad de México',
      state: 'CDMX',
      postal_code: '11560',
      country: 'México',
    })
    expect(result.success).toBe(true)
  })

  it('should default country to México', () => {
    const result = propertyAddressSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country).toBe('México')
    }
  })
})

describe('coordinatesSchema', () => {
  it('should validate valid coordinates', () => {
    const result = coordinatesSchema.safeParse({ lat: 19.4326, lng: -99.1332 })
    expect(result.success).toBe(true)
  })

  it('should reject missing lat', () => {
    const result = coordinatesSchema.safeParse({ lng: -99.1332 })
    expect(result.success).toBe(false)
  })

  it('should reject missing lng', () => {
    const result = coordinatesSchema.safeParse({ lat: 19.4326 })
    expect(result.success).toBe(false)
  })

  it('should reject non-numeric values', () => {
    const result = coordinatesSchema.safeParse({ lat: 'abc', lng: 'def' })
    expect(result.success).toBe(false)
  })
})
