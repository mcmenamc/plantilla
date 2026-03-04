import axios from 'axios'
import { env } from '@/env'
import { useAuthStore } from '@/stores/auth-store'
export const api = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add the token to every request
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().auth.accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const { refreshToken } = useAuthStore.getState().auth
                await refreshToken()

                // Update header with new token
                const newToken = useAuthStore.getState().auth.accessToken
                originalRequest.headers.Authorization = `Bearer ${newToken}`

                return api(originalRequest)
            } catch (refreshError) {
                // Token refresh failed, logout
                const { reset } = useAuthStore.getState().auth
                reset()
                window.location.href = '/sign-in'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)
