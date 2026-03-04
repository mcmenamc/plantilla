import { Bell } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { NotificationList } from './notification-list'
import { useState } from 'react'

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const { getUnreadCount } = useNotificationStore()
    const unreadCount = getUnreadCount()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Abrir notificaciones"
                    aria-describedby="notification-sheet-description"
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
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="pb-4 text-start">
                    <SheetTitle>Notificaciones</SheetTitle>
                    <SheetDescription id="notification-sheet-description">
                        Mantente al tanto de las actualizaciones importantes
                    </SheetDescription>
                </SheetHeader>
                <NotificationList onClose={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    )
}
