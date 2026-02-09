import { describe, it, expect } from 'vitest'
import { cn, formatCurrency } from '../utils'

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('active')
  })

  it('should handle false/undefined/null values', () => {
    const result = cn('base', false, undefined, null, 'valid')
    expect(result).toBe('base valid')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2')
    // tailwind-merge should keep only the last padding
    expect(result).toBe('p-2')
  })

  it('should handle conflicting tailwind utilities', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should handle array inputs', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle object syntax from clsx', () => {
    const result = cn({ 'text-red-500': true, 'text-blue-500': false })
    expect(result).toBe('text-red-500')
  })

  it('should merge complex tailwind combinations', () => {
    const result = cn(
      'rounded-md bg-white p-4',
      'bg-gray-100 px-6'
    )
    // bg-gray-100 should override bg-white, px-6 should override p-4 for x
    expect(result).toContain('bg-gray-100')
    expect(result).toContain('rounded-md')
  })
})

describe('formatCurrency', () => {
  it('should format numbers as Mexican pesos', () => {
    const result = formatCurrency(1000000)
    // Intl format for es-MX MXN
    expect(result).toContain('1,000,000')
    expect(result).toContain('$')
  })

  it('should format zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('$')
    expect(result).toContain('0')
  })

  it('should not include decimal places', () => {
    const result = formatCurrency(1500.75)
    // maximumFractionDigits: 0
    expect(result).not.toContain('.75')
  })

  it('should format small numbers', () => {
    const result = formatCurrency(100)
    expect(result).toContain('100')
  })

  it('should format large numbers with commas', () => {
    const result = formatCurrency(25000000)
    expect(result).toContain('25')
  })

  it('should handle negative numbers', () => {
    const result = formatCurrency(-5000)
    expect(result).toContain('5,000')
  })
})
