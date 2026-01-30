"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

type AuthMode = "login" | "register" | "magic";

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("login");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-white">
                            LIVOO <span className="text-[#B8975A]">Bienes Raíces</span>
                        </h1>
                    </Link>
                    <p className="text-white/70 mt-2">
                        {mode === "login" && "¡Bienvenido de nuevo!"}
                        {mode === "register" && "Únete a nosotros"}
                        {mode === "magic" && "Acceso sin contraseña"}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-4 text-center font-semibold transition-all ${mode === "login"
                                    ? "text-[#B8975A] bg-white/10 border-b-2 border-[#B8975A]"
                                    : "text-white/60 hover:bg-white/5"
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`flex-1 py-4 text-center font-semibold transition-all ${mode === "register"
                                    ? "text-[#B8975A] bg-white/10 border-b-2 border-[#B8975A]"
                                    : "text-white/60 hover:bg-white/5"
                                }`}
                        >
                            Registrarse
                        </button>
                        <button
                            onClick={() => setMode("magic")}
                            className={`flex-1 py-4 text-center font-semibold transition-all ${mode === "magic"
                                    ? "text-[#B8975A] bg-white/10 border-b-2 border-[#B8975A]"
                                    : "text-white/60 hover:bg-white/5"
                                }`}
                        >
                            Magic Link
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {mode === "login" && (
                            <div className="space-y-6">
                                <LoginForm />
                                <OAuthButtons />
                            </div>
                        )}

                        {mode === "register" && (
                            <div className="space-y-6">
                                <RegisterForm />
                                <OAuthButtons />
                            </div>
                        )}

                        {mode === "magic" && <MagicLinkForm />}
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-white/60 hover:text-[#B8975A] transition-colors text-sm"
                    >
                        ← Regresar al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
