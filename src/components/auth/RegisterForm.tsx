'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { signUp } from '@/app/auth/actions'
import { useState, useTransition } from 'react'

export function RegisterForm() {
    const [error, setError] = useState<string>()
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterInput) => {
        setError(undefined)

        startTransition(async () => {
            const formData = new FormData()
            formData.append('fullName', data.fullName)
            formData.append('email', data.email)
            formData.append('password', data.password)

            const result = await signUp(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Nombre Completo"
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#B8975A] transition-all disabled:opacity-50"
                />
                {errors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
                )}
            </div>

            <div>
                <input
                    {...register('email')}
                    type="email"
                    placeholder="Email"
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#B8975A] transition-all disabled:opacity-50"
                />
                {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
            </div>

            <div>
                <input
                    {...register('password')}
                    type="password"
                    placeholder="Contraseña"
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#B8975A] transition-all disabled:opacity-50"
                />
                {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
            </div>

            <div>
                <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Confirmar Contraseña"
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#B8975A] transition-all disabled:opacity-50"
                />
                {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-gradient-to-r from-[#B8975A] to-[#8B7355] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            <div className="text-xs text-white/60 mt-2">
                <p>La contraseña debe tener:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una mayúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un carácter especial (!@#$%^&*)</li>
                </ul>
            </div>
        </form>
    )
}
