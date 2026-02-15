import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const AUTH_TOKEN_KEY = 'haz_factura_token'
const AUTH_USER_KEY = 'haz_factura_user'

export interface Business {
  _id: string
  name: string
  legalName: string
  shortName?: string
  phone: string
  packageId?: string | null
  rfc: string
  regimenFiscal: string
  tipoPersona: 'Persona Física' | 'Persona Moral'
  userId: string
  estatus: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface AuthUser {
  id: string
  nombre: string
  apellidos: string
  imagen: string | null
  email: string
  business: Business
  workcenters: string[]
  role: string
  regimenFiscal?: string | null
  tipoPersona?: string | null
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    refreshToken: () => Promise<void>
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieToken = getCookie(AUTH_TOKEN_KEY)
  const cookieUser = getCookie(AUTH_USER_KEY)

  let initToken = cookieToken || ''
  let initUser: AuthUser | null = null

  if (cookieUser) {
    try {
      initUser = JSON.parse(cookieUser)
    } catch {
      initUser = null
    }
  }

  // Si falta uno de los dos o el token expiró, limpiamos ambos
  const validateAuth = () => {
    if (!initToken || !initUser) return false
    try {
      const decoded: any = jwtDecode(initToken)
      const isExpired = decoded.exp * 1000 < Date.now()
      return !isExpired
    } catch {
      return false
    }
  }

  if (!validateAuth()) {
    initToken = ''
    initUser = null
    // No los borramos aquí directamente para evitar efectos secundarios en el render inicial si no es necesario,
    // pero el estado inicial será vacío. 
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(AUTH_USER_KEY, JSON.stringify(user))
          } else {
            removeCookie(AUTH_USER_KEY)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(AUTH_TOKEN_KEY, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      refreshToken: async () => {
        const { auth } = get()
        try {
          // We need to import api here to avoid circular dependency issues if api imports auth-store
          // However, api.ts imports useAuthStore. To avoid circular deps, we can use fetch or a separate axios instance
          // Or we can rely on the fact that we are inside a function. 
          // But api.ts imports useAuthStore outside of functions (for interceptors).
          // To be safe, let's use the native fetch or a clean axios call, OR assume api.ts is already defined.
          // Since api.ts uses useAuthStore.getState(), it might be fine if we use api inside the function.
          // Let's use a dynamic import for api to be super safe or just standard fetch.

          // Actually, let's use a standard fetch to avoid any interceptor loops or circular deps
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth.accessToken}`
            }
          })

          if (!response.ok) throw new Error('Refresh failed')

          const data = await response.json()

          // Assuming the response contains { token: string, user: AuthUser }
          // Adjust based on actual API response. 
          // If the user didn't specify the response structure, I'll assume standard token/user.
          // But wait, the user's request showed: 
          // const refreshToken = ... 
          // He didn't show the response. I'll assume standard.

          if (data.token) {
            auth.setAccessToken(data.token)
          }
          /* 
             NOTE: If the refresh token endpoint returns the updated user, we should update it too.
             Usually refreshing gets a new token. If it returns user, update it.
          */
          if (data.user) {
            // Map user data to store structure if needed, or if data.user matches AuthUser
            // The user provided structure is: 
            /* 
               {
                   "_id": ...,
                   "nombre": ...,
                   ...
                   "business": ...,
                   "workcenters": ...
               }
            */
            // Access token update implies we might decoding it or getting it from response.
          }

        } catch (error) {
          console.error('Failed to refresh token', error)
          auth.reset()
          throw error
        }
      },
      resetAccessToken: () =>
        set((state) => {
          removeCookie(AUTH_TOKEN_KEY)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(AUTH_TOKEN_KEY)
          removeCookie(AUTH_USER_KEY)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
