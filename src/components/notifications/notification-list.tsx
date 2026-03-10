import { useNotifications } from '@/hooks/use-notifications'
import { NotificationItem } from './notification-item'

interface NotificationListProps {
    onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
    const { notifications, markAllAsRead, clearAll, unreadCount } = useNotifications()

    return (
        <div className="flex flex-col">
            {/* Header Actions */}
            {notifications.length > 0 && (
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/10">
                    <button
                        onClick={() => clearAll()}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-medium"
                    >
                        Limpiar todas
                    </button>
                    <button
                        onClick={() => markAllAsRead()}
                        disabled={unreadCount === 0}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-medium"
                    >
                        Todas leídas
                    </button>
                </div>
            )}

            {/* Notifications List with Scroll */}
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[400px]">
                {notifications.length === 0 ? (
                    <div className="text-muted-foreground flex h-32 items-center justify-center text-center text-sm">
                        No hay notificaciones
                    </div>
                ) : (
                    <div className="space-y-0 pb-2">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
