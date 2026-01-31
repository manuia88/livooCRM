import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Search, Settings } from 'lucide-react'

interface UserHeaderProps {
    user: {
        name: string
        avatar?: string
    }
    summary: {
        user_level: string
    }
}

export function UserHeader({ user, summary }: UserHeaderProps) {
    const level = summary?.user_level || 'Broker Profesional'
    const name = user?.name || 'Usuario'
    const avatar = user?.avatar || ''

    return (
        <div className="bg-[#FDFCFB] border-b border-[#E5E3DB] py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-sm ring-1 ring-[#E5E3DB]">
                            <AvatarImage src={avatar} />
                            <AvatarFallback className="bg-[#F8F7F4] text-[#2C3E2C] text-xl font-medium">
                                {name[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-medium tracking-tight text-[#2C3E2C]">
                                ¡Hola, {name}!
                            </h1>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-[#B8975A]/10 text-[#B8975A] border-none font-medium px-3 py-1 text-xs">
                                    {level}
                                </Badge>
                                <span className="text-gray-300 text-xs">•</span>
                                <span className="text-gray-500 text-xs font-medium">Panel de Gestión</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-10 w-10 rounded-full border border-[#E5E3DB] flex items-center justify-center hover:bg-[#F8F7F4] transition-colors relative">
                            <Bell className="w-5 h-5 text-[#777]" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="h-10 w-10 rounded-full border border-[#E5E3DB] flex items-center justify-center hover:bg-[#F8F7F4] transition-colors">
                            <Settings className="w-5 h-5 text-[#777]" />
                        </button>
                        <div className="h-10 w-[1px] bg-[#E5E3DB] mx-2 hidden md:block" />
                        <Button className="bg-[#2C3E2C] hover:bg-black text-white rounded-full px-6 font-medium transition-all shadow-sm">
                            Nueva Propiedad
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

