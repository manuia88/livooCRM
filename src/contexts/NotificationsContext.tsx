'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link_url?: string
  is_read: boolean
  priority: string
  icon?: string
  created_at: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Cargar notificaciones iniciales
  useEffect(() => {
    loadNotifications()
  }, [])

  // Suscribirse a nuevas notificaciones en tiempo real
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Crear canal de Realtime
      const newChannel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification

            // Agregar a la lista
            setNotifications(prev => [newNotification, ...prev])

            // Mostrar toast
            toast(newNotification.title, {
              description: newNotification.message,
              icon: newNotification.icon,
              action: newNotification.link_url ? {
                label: 'Ver',
                onClick: () => window.location.href = newNotification.link_url!
              } : undefined,
              duration: 5000
            })
          }
        )
        .subscribe()

      setChannel(newChannel)
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  async function loadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Load notifications error:', error)
      return
    }

    setNotifications(data || [])
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Mark as read error:', error)
      return
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  async function markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)

    if (error) {
      console.error('Mark all as read error:', error)
      return
    }

    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    )
  }

  async function deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete notification error:', error)
      return
    }

    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function clearAll() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todas

    if (error) {
      console.error('Clear all error:', error)
      return
    }

    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
