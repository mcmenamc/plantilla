import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as NotificationsApi from '@/features/notifications/data/notifications-api'

export function useNotifications() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', 'my'],
        queryFn: NotificationsApi.getMyNotifications,
        refetchInterval: 30000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: NotificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: NotificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: NotificationsApi.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: NotificationsApi.clearAllNotifications,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
        },
    });

    const notifications = query.data || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        markAsRead: (id: string) => markAsReadMutation.mutate(id),
        markAllAsRead: () => markAllAsReadMutation.mutate(),
        deleteNotification: (id: string) => deleteMutation.mutate(id),
        clearAll: () => clearAllMutation.mutate(),
    };
}
