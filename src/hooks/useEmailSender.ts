'use client'

import { useMutation } from '@tanstack/react-query'
import type { EmailTemplate } from '@/lib/email/resend-client'

interface SendEmailPayload {
  type: EmailTemplate
  email: string
  agencyId?: string
  [key: string]: unknown
}

async function sendEmailViaApi(payload: SendEmailPayload) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al enviar email')
  }

  return response.json()
}

export function useSendWelcomeEmail() {
  return useMutation({
    mutationFn: (params: { email: string; firstName: string; agencyId?: string }) =>
      sendEmailViaApi({ type: 'welcome', ...params })
  })
}

export function useSendTaskReminderEmail() {
  return useMutation({
    mutationFn: (params: {
      email: string
      firstName: string
      task: { title: string; description: string; dueDate: string; id: string }
      agencyId?: string
    }) => sendEmailViaApi({ type: 'task_reminder', ...params })
  })
}

export function useSendTareaAsignadaEmail() {
  return useMutation({
    mutationFn: (params: {
      email: string
      assignedToName: string
      assignedByName: string
      taskTitle: string
      taskDescription?: string
      dueDate?: string
      priority: 'alta' | 'media' | 'baja'
      taskId: string
      agencyId?: string
    }) => sendEmailViaApi({ type: 'task_assigned', ...params })
  })
}

export function useSendNuevaCaptacionEmail() {
  return useMutation({
    mutationFn: (params: {
      email: string
      managerName: string
      producerName: string
      propertyTitle: string
      propertyType: string
      operationType: string
      price: string
      address: string
      propertyId: string
      agencyId?: string
    }) => sendEmailViaApi({ type: 'nueva_captacion', ...params })
  })
}

export function useSendNuevoLeadEmail() {
  return useMutation({
    mutationFn: (params: {
      email: string
      agentName: string
      leadName: string
      leadEmail?: string
      leadPhone?: string
      propertyInterested?: string
      message?: string
      source?: string
      contactId: string
      agencyId?: string
    }) => sendEmailViaApi({ type: 'nuevo_lead', ...params })
  })
}
