"use client";

import { useState } from "react";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "register";

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Validate password confirmation for registration
        if (mode === "register") {
            const password = formData.get("password") as string;
            const confirmPassword = formData.get("confirmPassword") as string;

            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden");
                setLoading(false);
                return;
            }
        }

        try {
            const result = mode === "login"
                ? await signIn(formData)
                : await signUp(formData);

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            setError("Ocurrió un error. Por favor intenta de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F7F4] via-white to-[#E5E3DB] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-[#2C3E2C]">
                            LIVOO <span className="text-[#B8975A]">Bienes Raíces</span>
                        </h1>
                    </Link>
                    <p className="text-[#556B55] mt-2">
                        {mode === "login" ? "¡Bienvenido de nuevo!" : "Únete a nosotros"}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E5E3DB] overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#E5E3DB]">
                        <button
                            onClick={() => {
                                setMode("login");
                                setError("");
                            }}
                            className={`flex-1 py-4 text-center font-semibold transition-all ${mode === "login"
                                    ? "text-[#B8975A] bg-[#F8F7F4] border-b-2 border-[#B8975A]"
                                    : "text-[#556B55] hover:bg-[#F8F7F4]"
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => {
                                setMode("register");
                                setError("");
                            }}
                            className={`flex-1 py-4 text-center font-semibold transition-all ${mode === "register"
                                    ? "text-[#B8975A] bg-[#F8F7F4] border-b-2 border-[#B8975A]"
                                    : "text-[#556B55] hover:bg-[#F8F7F4]"
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Full Name - Register only */}
                        {mode === "register" && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-[#2C3E2C] mb-2">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#556B55]" />
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        required
                                        className="w-full pl-11 pr-4 py-3 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A] focus:border-transparent transition-all"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#2C3E2C] mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#556B55]" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A] focus:border-transparent transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#2C3E2C] mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#556B55]" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Confirm Password - Register only */}
                        {mode === "register" && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C3E2C] mb-2">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#556B55]" />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-4 py-3 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A] focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white py-6 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </span>
                            ) : mode === "login" ? (
                                "Iniciar Sesión"
                            ) : (
                                "Crear Cuenta"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-[#556B55] hover:text-[#B8975A] transition-colors text-sm"
                    >
                        ← Regresar al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
