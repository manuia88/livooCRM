import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="py-24 bg-gradient-to-br from-[#2C3E2C] via-[#3F5140] to-[#2C3E2C] text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B8975A] rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7D8F77] rounded-full blur-3xl" />
            </div>
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, #B8975A 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }} />

            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10 sm:p-14">
                <div className="w-20 h-1 bg-gradient-to-r from-[#B8975A] to-[#D4C19C] rounded-full mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    ¿Listo para encontrar tu hogar ideal?
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Nuestros expertos están listos para guiarte en cada paso de la compra o renta.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A] text-white rounded-2xl px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-auto"
                    >
                        Contáctanos
                    </Button>
                    <Link href="/propiedades">
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#2C3E2C] rounded-2xl px-10 py-6 text-lg font-semibold h-auto transition-all duration-300 hover:scale-[1.02]"
                        >
                            Explorar Propiedades
                        </Button>
                    </Link>
                </div>
                </div>
            </div>
        </section>
    );
}
