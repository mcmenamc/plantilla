export const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'https://api.hazfactura.com/api',
} as const
