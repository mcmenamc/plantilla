import { createFileRoute } from '@tanstack/react-router'
import { ConfigurarCuenta } from '@/features/configurar-cuenta'

export const Route = createFileRoute('/configurar-cuenta')({
    component: ConfigurarCuenta,
})
