import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2C3E2C] to-[#1a1a1a] relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#B8975A]/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#556B55]/20 rounded-full filter blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Reset Password Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            LIVOO <span className="text-[#B8975A]">Bienes Raíces</span>
                        </h1>
                        <p className="text-white/70 text-sm">Establece tu nueva contraseña</p>
                    </div>

                    <UpdatePasswordForm />
                </div>

                {/* Footer */}
                <p className="text-center text-white/50 text-sm mt-6">
                    © 2024 Livoo Bienes Raíces. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
