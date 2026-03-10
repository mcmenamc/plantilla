import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import type { Notification } from '@/features/notifications/data/notifications-api'

import { useState } from 'react'

interface NotificationItemProps {
    notification: Notification
    onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const navigate = useNavigate()
    const { markAsRead, deleteNotification } = useNotifications()
    const [isExpanded, setIsExpanded] = useState(false)

    const isLongMessage = notification.message.length > 120
    const displayMessage = isExpanded ? notification.message : notification.message.slice(0, 120) + (isLongMessage ? '...' : '')

    const typeConfig = {
        info: {
            icon: Info,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        success: {
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/30'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-orange-600',
            bg: 'bg-orange-100 dark:bg-orange-900/30'
        },
        error: {
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/30'
        }
    }

    const { icon: Icon, color, bg } = typeConfig[notification.type || 'info']

    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification._id)
        }

        if (notification.link) {
            navigate({ to: notification.link as any })
        }

        onClose?.()
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteNotification(notification._id)
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                'group relative flex cursor-pointer gap-4 border-b bg-background px-4 py-3 transition-colors hover:bg-accent/50',
                !notification.isRead && 'bg-accent/10'
            )}
        >
            {/* Icon Based on Type */}
            <div className="flex-shrink-0 mt-0.5">
                <div className={cn("flex size-9 items-center justify-center rounded-md", bg)}>
                    <Icon className={cn("size-5", color)} />
                </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold leading-tight uppercase tracking-tight">{notification.title}</h4>
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
                <p className={cn("text-muted-foreground mt-1 text-xs leading-snug break-words", isExpanded ? "" : "line-clamp-3")}>
                    {displayMessage}
                </p>
                {isLongMessage && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                        className="text-[10px] text-primary hover:underline mt-1 font-semibold uppercase tracking-wider"
                    >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                )}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-muted-foreground text-[10px] uppercase font-medium">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                        })}
                    </p>
                    {/* Unread dot indicator on the right side */}
                    {!notification.isRead && (
                        <div className="bg-orange-600 size-2 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
                    )}
                </div>
            </div>
        </div>
    )
}
