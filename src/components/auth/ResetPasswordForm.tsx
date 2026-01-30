'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Mail, ArrowLeft, Check } from 'lucide-react'

interface ResetPasswordFormProps {
    onBack?: () => void
}

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string>()
    const [isPending, startTransition] = useTransition()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(undefined)

        if (!email) {
            setError('Por favor ingresa tu email')
            return
        }

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setSent(true)
            }
        })
    }

    if (sent) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        ¡Correo enviado!
                    </h3>
                    <p className="text-white/70 text-sm">
                        Te enviamos instrucciones para restablecer tu contraseña a <strong>{email}</strong>
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                        Revisa tu bandeja de entrada y spam
                    </p>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="text-[#B8975A] text-sm hover:underline flex items-center gap-1 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </button>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
                <Mail className="w-12 h-12 mx-auto text-[#B8975A] mb-2" />
                <h3 className="text-lg font-semibold text-white">Restablecer Contraseña</h3>
                <p className="text-white/70 text-sm">
                    Ingresa tu email y te enviaremos instrucciones
                </p>
            </div>

            <div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#B8975A] transition-all disabled:opacity-50"
                    required
                />
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
                {isPending ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>

            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full text-white/60 hover:text-white text-sm flex items-center justify-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </button>
            )}
        </form>
    )
}
