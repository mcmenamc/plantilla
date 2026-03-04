import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LucideIcon } from 'lucide-react'

export interface Notification {
    id: string
    logo: LucideIcon | string // Lucide icon component or image URL
    title: string
    description: string
    actionUrl: string
    read: boolean
    createdAt: Date
}

interface NotificationState {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    clearAll: () => void
    getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: crypto.randomUUID(),
                    read: false,
                    createdAt: new Date(),
                }
                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                }))
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }))
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }))
            },

            deleteNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }))
            },

            clearAll: () => {
                set({ notifications: [] })
            },

            getUnreadCount: () => {
                return get().notifications.filter((n) => !n.read).length
            },
        }),
        {
            name: 'haz-factura-notifications',
            // Convert Date objects to strings for storage
            partialize: (state) => ({
                notifications: state.notifications.map((n) => ({
                    ...n,
                    createdAt: n.createdAt.toISOString(),
                })),
            }),
            // Convert strings back to Date objects when loading
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                ...persistedState,
                notifications: persistedState.notifications?.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.createdAt),
                })) || [],
            }),
        }
    )
)
