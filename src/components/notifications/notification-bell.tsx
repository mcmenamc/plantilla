import { Bell } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationList } from './notification-list'
import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const { unreadCount } = useNotifications()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Abrir notificaciones"
                    className="relative rounded-full"
                >
                    <Bell aria-hidden="true" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold leading-none tracking-tight">Notificaciones</h4>
                </div>
                <NotificationList onClose={() => setOpen(false)} />
            </PopoverContent>
        </Popover>
    )
}
