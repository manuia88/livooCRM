'use client'

import { NewPropertyWizard } from '@/components/backoffice/NewPropertyWizard'

export default function CaptacionesPage() {
  return (
    <NewPropertyWizard
      title="Captaciones"
      redirectOnSuccess="/backoffice/captaciones"
      submitButtonLabel="Crear Propiedad"
    />
  )
}
