'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ContactTasksSection } from '@/components/contacts/ContactTasksSection'
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Tag,
    TrendingUp,
    Edit,
    MessageSquare,
    User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ContactDetailPage() {
    const params = useParams()
    const router = useRouter()
    const contactId = params.id as string

    const { data: contact, isLoading } = useQuery({
        queryKey: ['contact', contactId],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('v_contacts_with_details')
                .select('*')
                .eq('id', contactId)
                .single()

            if (error) throw error
            return data
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando contacto...</p>
                </div>
            </div>
        )
    }

    if (!contact) {
        return (
            <div className="text-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md mx-auto">
                <p className="text-gray-600 mb-4">Contacto no encontrado</p>
                <AppleButton variant="secondary" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver
                </AppleButton>
            </div>
        )
    }

    const getTypeBadge = (type: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            buyer: { variant: 'default', label: 'Comprador' },
            seller: { variant: 'secondary', label: 'Vendedor' },
            owner: { variant: 'outline', label: 'Propietario' },
            tenant: { variant: 'outline', label: 'Inquilino' },
            investor: { variant: 'default', label: 'Inversionista' },
        }
        const config = variants[type] || { variant: 'secondary', label: type }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            lead: { variant: 'secondary', label: 'Lead' },
            contacted: { variant: 'outline', label: 'Contactado' },
            qualified: { variant: 'default', label: 'Calificado' },
            negotiating: { variant: 'default', label: 'Negociando' },
            closed_won: { variant: 'default', label: 'Ganado' },
            closed_lost: { variant: 'destructive', label: 'Perdido' },
            inactive: { variant: 'secondary', label: 'Inactivo' },
        }
        const config = variants[status] || { variant: 'secondary', label: status }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getLeadScoreColor = (score: number | null) => {
        if (!score) return 'text-gray-400'
        if (score >= 80) return 'text-green-600'
        if (score >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <PageContainer
            title={contact.full_name}
            subtitle="Perfil del contacto"
            icon={User}
            actions={
                <div className="flex gap-2 sm:gap-3">
                    <AppleButton
                        variant="secondary"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver
                    </AppleButton>
                    <AppleButton variant="secondary">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Mensaje
                    </AppleButton>
                    <AppleButton>
                        <Edit className="h-5 w-5 mr-2" />
                        Editar
                    </AppleButton>
                </div>
            }
        >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact Info - Estilo Apple */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Basic Info Card */}
                    <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white text-xl">
                                        {contact.first_name[0]}
                                        {contact.last_name?.[0] || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{contact.full_name}</CardTitle>
                                    <div className="flex gap-2 mt-1">
                                        {getTypeBadge(contact.contact_type)}
                                        {getStatusBadge(contact.status)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contact.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-[#556B55]" />
                                    <span className="text-sm">{contact.email}</span>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-[#556B55]" />
                                    <span className="text-sm">{contact.phone}</span>
                                </div>
                            )}
                            {contact.source && (
                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-[#556B55]" />
                                    <span className="text-sm">{contact.source}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-[#556B55]" />
                                <span className="text-sm">
                                    Creado {formatDistanceToNow(new Date(contact.created_at), {
                                        addSuffix: true,
                                        locale: es
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lead Score Card */}
                    <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-base">Lead Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className={`h-6 w-6 ${getLeadScoreColor(contact.lead_score)}`} />
                                    <span className={`text-4xl font-bold ${getLeadScoreColor(contact.lead_score)}`}>
                                        {contact.lead_score || 0}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#556B55]">de 100</p>
                                    <p className="text-xs text-[#556B55] mt-1">
                                        {contact.lead_score && contact.lead_score >= 70 ? 'Alto potencial' :
                                            contact.lead_score && contact.lead_score >= 40 ? 'Potencial medio' :
                                                'Necesita desarrollo'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Tasks */}
                <div className="lg:col-span-2">
                    <ContactTasksSection
                        contactId={contact.id}
                        contactName={contact.full_name}
                        lastInteractionAt={contact.last_interaction}
                    />
                </div>
            </div>
        </PageContainer>
    )
}
