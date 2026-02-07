import { InventoryProperty } from '../types'

interface InventoryDashboardProps {
    onValuationClick: () => void
    properties: InventoryProperty[]
}

export default function InventoryDashboard({ onValuationClick, properties }: InventoryDashboardProps) {
    const totalCount = properties.length
    const exclusiveCount = properties.filter(p => p.exclusive).length

    const highQuality = properties.filter(p => p.health_score >= 80).length
    const midQuality = properties.filter(p => p.health_score >= 50 && p.health_score < 80).length
    const lowQuality = properties.filter(p => p.health_score < 50).length

    const avgHealth = totalCount > 0
        ? Math.round(properties.reduce((acc, p) => acc + (p.health_score || 0), 0) / totalCount)
        : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Conteo */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col justify-center gap-4">
                <div>
                    <p className="text-[32px] font-bold text-[#111827] leading-none">{totalCount}</p>
                    <p className="text-sm font-medium text-[#6B7280] mt-1">Propiedades</p>
                </div>
                <div>
                    <p className="text-[20px] font-bold text-[#111827] leading-none">{exclusiveCount}</p>
                    <p className="text-xs font-medium text-[#6B7280] mt-1 uppercase tracking-wider">Exclusivas</p>
                </div>
            </div>

            {/* Card 2: Calidad General */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                <p className="text-sm font-bold text-[#111827] uppercase tracking-wider">Alta Calidad Gral.</p>

                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20">
                        {/* SVG Progress Rings */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="#F3F4F6" strokeWidth="6" fill="transparent" />
                            <circle
                                cx="40" cy="40" r="32"
                                stroke="#0D9488" strokeWidth="6" fill="transparent"
                                strokeDasharray={2 * Math.PI * 32}
                                strokeDashoffset={2 * Math.PI * 32 * (1 - avgHealth / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-[#111827]">{avgHealth}%</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                <span>Alta: {highQuality}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                <span>Media: {midQuality}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                                <span>Baja: {lowQuality}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Valuación */}
            <div
                className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4"
                onClick={onValuationClick}
            >
                <p className="text-sm font-bold text-[#111827] uppercase tracking-wider">Valuación</p>

                <div className="flex items-end h-20 gap-3">
                    {/* Mini-Gráfico de Barras */}
                    {[
                        { color: '#0D9488', height: 'h-[80%]' },
                        { color: '#F59E0B', height: 'h-[50%]' },
                        { color: '#EF4444', height: 'h-[30%]' },
                        { color: '#D1D5DB', height: 'h-[10%]' }
                    ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full flex flex-col gap-0.5 h-full justify-end">
                                <div className="w-full h-2 rounded-full bg-gray-100 mb-0.5" />
                                <div className="w-full h-2 rounded-full bg-gray-100 mb-0.5" />
                                <div className="w-full h-2 rounded-full bg-gray-100 mb-0.5" />
                                <div className={`w-full ${bar.height} rounded-full`} style={{ backgroundColor: bar.color }} />
                            </div>
                            <div className="w-full h-1 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-[#9CA3AF] font-medium text-center italic">Click para ver análisis detallado</p>
            </div>
        </div>
    )
}
