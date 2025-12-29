import { createFileRoute } from '@tanstack/react-router'
import { PruebaGratis } from '@/features/prueba-gratis'

export const Route = createFileRoute('/prueba-gratis')({
  component: PruebaGratis,
})
