import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../auth'

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('inválido')
    }
  })

  it('should reject empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('6')
    }
  })

  it('should accept password exactly 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validRegistration = {
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'Secure1!',
    confirmPassword: 'Secure1!',
  }

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validRegistration)
    expect(result.success).toBe(true)
  })

  it('should reject fullName shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      fullName: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('should reject fullName longer than 100 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      fullName: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'Abc1!',
      confirmPassword: 'Abc1!',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'secure1!',
      confirmPassword: 'secure1!',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without number', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'Securee!',
      confirmPassword: 'Securee!',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without special character', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'Secure12',
      confirmPassword: 'Secure12',
    })
    expect(result.success).toBe(false)
  })

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'Secure1!',
      confirmPassword: 'Different1!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('coinciden')
    }
  })

  it('should accept strong password with all requirements', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'MyStr0ng!Pass',
      confirmPassword: 'MyStr0ng!Pass',
    })
    expect(result.success).toBe(true)
  })
})
