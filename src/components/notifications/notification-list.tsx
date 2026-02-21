import { CheckCheck, Trash2 } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NotificationItem } from './notification-item'

interface NotificationListProps {
    onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
    const { notifications, markAllAsRead, clearAll } = useNotificationStore()

    const unreadNotifications = notifications.filter((n) => !n.read)
    const readNotifications = notifications.filter((n) => n.read)

    return (
        <div className="flex h-full flex-col">
            {/* Header Actions */}
            {notifications.length > 0 && (
                <div className="flex gap-2 pb-3">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={markAllAsRead}
                        className="flex-1 text-xs"
                        disabled={unreadNotifications.length === 0}
                    >
                        <CheckCheck className="mr-1.5 size-3.5" />
                        Marcar leídas
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAll}
                        className="flex-1 text-xs"
                    >
                        <Trash2 className="mr-1.5 size-3.5" />
                        Limpiar
                    </Button>
                </div>
            )}

            {/* Notifications List with Scroll */}
            <ScrollArea className="flex-1 -mx-1 px-1">
                {notifications.length === 0 ? (
                    <div className="text-muted-foreground flex h-32 items-center justify-center text-center text-sm">
                        No hay notificaciones
                    </div>
                ) : (
                    <div className="space-y-3 pb-2">
                        {/* Unread Notifications */}
                        {unreadNotifications.length > 0 && (
                            <div>
                                <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                                    Nuevas ({unreadNotifications.length})
                                </h3>
                                <div className="space-y-1.5">
                                    {unreadNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onClose={onClose}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Separator */}
                        {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                            <Separator className="my-3" />
                        )}

                        {/* Read Notifications */}
                        {readNotifications.length > 0 && (
                            <div>
                                <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                                    Anteriores
                                </h3>
                                <div className="space-y-1.5">
                                    {readNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onClose={onClose}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
