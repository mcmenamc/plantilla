import { api } from '@/lib/api'

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    createdAt: string;
    link?: string;
    metadata?: {
        customerId?: string;
        errors?: any[];
    }
}

export const getMyNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/my')
    return response.data
}

export const markAsRead = async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
}

export const markAllAsRead = async (): Promise<void> => {
    await api.put('/notifications/read-all')
}

export const deleteNotification = async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
}

export const clearAllNotifications = async (): Promise<void> => {
    await api.delete('/notifications')
}
