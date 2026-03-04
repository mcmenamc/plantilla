import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/stores/notification-store'
import { useNotificationStore } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'

interface NotificationItemProps {
    notification: Notification
    onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const navigate = useNavigate()
    const { markAsRead, deleteNotification } = useNotificationStore()

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id)
        }
        navigate({ to: notification.actionUrl })
        onClose?.()
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteNotification(notification.id)
    }

    const Logo = notification.logo

    return (
        <div
            onClick={handleClick}
            className={cn(
                'group relative flex cursor-pointer gap-2.5 rounded-md border px-2.5 py-2 transition-colors hover:bg-accent',
                !notification.read && 'bg-accent/30'
            )}
        >
            {/* Unread indicator */}
            {!notification.read && (
                <div className="bg-primary absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full" />
            )}

            {/* Logo */}
            <div className="flex-shrink-0">
                {typeof Logo === 'string' ? (
                    <img src={Logo} alt="" className="size-8 rounded object-cover" />
                ) : (
                    <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded">
                        <Logo className="size-4" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-tight">{notification.title}</h4>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleDelete}
                        className="size-5 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Eliminar notificación"
                    >
                        <X className="size-3" />
                    </Button>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug">
                    {notification.description}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                    {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: es,
                    })}
                </p>
            </div>
        </div>
    )
}
