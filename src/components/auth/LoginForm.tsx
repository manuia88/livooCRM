'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { signIn } from '@/app/auth/actions'
import { useState, useTransition } from 'react'

export function LoginForm() {
    const [error, setError] = useState<string>()
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginInput) => {
        setError(undefined)

        startTransition(async () => {
            const formData = new FormData()
            formData.append('email', data.email)
            formData.append('password', data.password)

            const result = await signIn(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    )
}
