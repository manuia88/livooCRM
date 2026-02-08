'use client'

import { NewPropertyWizard } from '@/components/backoffice/NewPropertyWizard'

export default function NuevaPropiedadPage() {
  return (
    <NewPropertyWizard
      title="Nueva Propiedad"
      redirectOnSuccess="/backoffice/propiedades"
      submitButtonLabel="Crear Propiedad"
    />
  )
}
