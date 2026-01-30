'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Check } from 'lucide-react'

const updatePasswordSchema = z.object({
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
        .regex(/[!@#$%^&*]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export function UpdatePasswordForm() {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string>()
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UpdatePasswordInput>({
        resolver: zodResolver(updatePasswordSchema),
    })

    const onSubmit = async (data: UpdatePasswordInput) => {
        setError(undefined)

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            })

            if (error) {
                setError(error.message)
            } else {
                setSuccess(true)
                // Redirect to backoffice after 2 seconds
                setTimeout(() => {
                    router.push('/backoffice')
                }, 2000)
            }
        })
    }

    if (success) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        ¡Contraseña actualizada!
                    </h3>
                    <p className="text-white/70 text-sm">
                        Tu contraseña se ha cambiado exitosamente
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                        Redirigiendo al backoffice...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-center mb-4">
                <Lock className="w-12 h-12 mx-auto text-[#B8975A] mb-2" />
                <h3 className="text-lg font-semibold text-white">Nueva Contraseña</h3>
                <p className="text-white/70 text-sm">
                    Ingresa tu nueva contraseña
                </p>
            </div>

            <div>
                <input
                    {...register('password')}
                    type="password"
                    placeholder="Nueva contraseña"
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
                    placeholder="Confirmar nueva contraseña"
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
                {isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
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
