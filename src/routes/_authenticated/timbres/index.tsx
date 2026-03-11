import { createFileRoute } from '@tanstack/react-router'
import TimbresPage from '@/features/timbres'

export const Route = createFileRoute('/_authenticated/timbres/')({
  component: TimbresPage,
})
