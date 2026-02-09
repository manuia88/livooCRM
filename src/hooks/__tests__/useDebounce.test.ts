import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    )

    expect(result.current).toBe('hello')

    // Change value
    rerender({ value: 'world', delay: 500 })

    // Value should not have changed yet
    expect(result.current).toBe('hello')

    // Advance time past delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now it should be updated
    expect(result.current).toBe('world')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )

    rerender({ value: 'ab', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'abc', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'abcd', delay: 300 })

    // Still should be 'a' since timer keeps resetting
    expect(result.current).toBe('a')

    // Advance past delay from last change
    act(() => { vi.advanceTimersByTime(300) })

    expect(result.current).toBe('abcd')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'fast', delay: 100 } }
    )

    rerender({ value: 'updated', delay: 100 })

    act(() => { vi.advanceTimersByTime(100) })

    expect(result.current).toBe('updated')
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'immediate', delay: 0 })

    act(() => { vi.advanceTimersByTime(0) })

    expect(result.current).toBe('immediate')
  })

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    )

    rerender({ value: 42, delay: 200 })

    expect(result.current).toBe(0)

    act(() => { vi.advanceTimersByTime(200) })

    expect(result.current).toBe(42)
  })

  it('should work with object values', () => {
    const initial = { search: '' }
    const updated = { search: 'test' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initial, delay: 300 } }
    )

    rerender({ value: updated, delay: 300 })

    expect(result.current).toBe(initial)

    act(() => { vi.advanceTimersByTime(300) })

    expect(result.current).toBe(updated)
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
