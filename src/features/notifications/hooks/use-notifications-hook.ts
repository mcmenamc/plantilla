import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as NotificationsApi from '../data/notifications-api'

export const useNotifications = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', 'my'],
        queryFn: NotificationsApi.getMyNotifications,
        refetchInterval: 30000, // Polling cada 30 segundos
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
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        clearAll: clearAllMutation.mutate,
    };
};
