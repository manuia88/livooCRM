import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

interface CreateNotificationParams {
  userId: string
  agencyId: string
  type: string
  title: string
  message: string
  linkUrl?: string
  relatedEntityType?: string
  relatedEntityId?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  icon?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: params.userId,
    p_agency_id: params.agencyId,
    p_type: params.type,
    p_title: params.title,
    p_message: params.message,
    p_link_url: params.linkUrl,
    p_related_entity_type: params.relatedEntityType,
    p_related_entity_id: params.relatedEntityId,
    p_priority: params.priority || 'normal',
    p_icon: params.icon
  })

  if (error) {
    console.error('Create notification error:', error)
    throw error
  }
}

// Uso:
// await createNotification({
//   userId: 'uuid',
//   agencyId: 'uuid',
//   type: 'reminder',
//   title: 'Recordatorio',
//   message: 'No olvides llamar a Juan',
//   priority: 'high',
//   icon: '📞'
// })
