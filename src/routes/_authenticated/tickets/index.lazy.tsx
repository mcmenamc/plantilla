import { createLazyFileRoute } from '@tanstack/react-router'
import Tickets from '@/features/tickets'

export const Route = createLazyFileRoute('/_authenticated/tickets/')({
  component: Tickets,
})
