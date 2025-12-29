import axios from 'axios'
import { env } from '@/env'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
    baseURL: env.VITE_API_URL,
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
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            const { reset } = useAuthStore.getState().auth
            reset()
            // Force redirect to sign-in
            window.location.href = '/sign-in'
        }
        return Promise.reject(error)
    }
)
