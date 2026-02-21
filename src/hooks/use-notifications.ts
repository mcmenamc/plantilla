import { useNotificationStore } from '@/stores/notification-store'

/**
 * Custom hook to access notification store
 * Provides convenient access to notification state and actions
 */
export function useNotifications() {
    const store = useNotificationStore()

    return {
        notifications: store.notifications,
        unreadCount: store.getUnreadCount(),
        addNotification: store.addNotification,
        markAsRead: store.markAsRead,
        markAllAsRead: store.markAllAsRead,
        deleteNotification: store.deleteNotification,
        clearAll: store.clearAll,
    }
}
