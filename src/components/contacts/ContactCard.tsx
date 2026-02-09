'use client'

import {
  Mail,
  Phone,
  MessageCircle,
  Star,
  MoreVertical,
  Calendar,
  User,
  Edit,
  ListTodo,
  Eye
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ContactCardProps {
  contact: {
    id: string
    first_name: string
    last_name?: string
    email?: string
    phone?: string
    whatsapp?: string
    avatar_url?: string
    lead_score?: number
    current_stage?: string
    last_interaction_at?: string
    tags?: string[]
    source?: string
    properties_interested?: number
  }
  variant?: 'default' | 'compact'
  onCall?: () => void
  onWhatsApp?: () => void
  onEmail?: () => void
  onView?: () => void
  onEdit?: () => void
  onCreateTask?: () => void
  className?: string
}

export function ContactCard({
  contact,
  variant = 'default',
  onCall,
  onWhatsApp,
  onEmail,
  onView,
  onEdit,
  onCreateTask,
  className
}: ContactCardProps) {
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  const initials = [contact.first_name?.[0], contact.last_name?.[0]].filter(Boolean).join('')
  const score = contact.lead_score ?? 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100'
    if (score >= 60) return 'text-yellow-700 bg-yellow-100'
    if (score >= 40) return 'text-orange-700 bg-orange-100'
    return 'text-red-700 bg-red-100'
  }

  const getStageLabel = (stage?: string) => {
    const labels: Record<string, string> = {
      'new': 'Nuevo',
      'contacted': 'Contactado',
      'qualified': 'Calificado',
      'proposal': 'Propuesta',
      'negotiation': 'Negociación',
      'won': 'Ganado',
      'lost': 'Perdido',
      'nurturing': 'Nurturing',
    }
    return labels[stage || ''] || stage || 'Sin etapa'
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:shadow-md cursor-pointer transition-all',
          className
        )}
        onClick={onView}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={contact.avatar_url} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
            <p className="text-xs text-gray-500 truncate">{contact.email || contact.phone || 'Sin contacto'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getScoreColor(score)}`}>
          <Star className="w-3 h-3 fill-current" />
          {score}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn(
      'bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300',
      className
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{fullName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="capitalize text-xs">
                  {getStageLabel(contact.current_stage)}
                </Badge>
                {contact.source && (
                  <span className="text-xs text-gray-400">{contact.source}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lead Score */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreColor(score)}`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">{score}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreateTask}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Crear tarea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 mb-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {contact.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Last Interaction */}
        {contact.last_interaction_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Calendar className="w-3 h-3" />
            <span>
              Última interacción: {new Date(contact.last_interaction_at).toLocaleDateString('es-MX')}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {onCall && contact.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={onCall}
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Llamar
            </Button>
          )}

          {onWhatsApp && (contact.whatsapp || contact.phone) && (
            <Button
              size="sm"
              className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white"
              onClick={onWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              WhatsApp
            </Button>
          )}

          {onEmail && contact.email && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={onEmail}
            >
              <Mail className="w-4 h-4 mr-1.5" />
              Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContactCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 pt-3 border-t">
        <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}
