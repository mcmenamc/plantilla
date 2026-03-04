import { useEffect } from 'react'
import { useNotificationStore } from '@/stores/notification-store'
import { mockNotifications } from '@/features/notifications/mock-notifications'

/**
 * Component to initialize mock notifications on first load
 * This should be rendered once in the app layout
 */
export function NotificationInitializer() {
    const { notifications, addNotification } = useNotificationStore()

    useEffect(() => {
        // Only add mock notifications if there are no notifications yet
        if (notifications.length === 0) {
            mockNotifications.forEach((notification) => {
                addNotification(notification)
            })
        }
    }, []) // Run only once on mount

    return null // This component doesn't render anything
}
