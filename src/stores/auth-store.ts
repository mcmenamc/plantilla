import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { env } from '@/env'

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

let refreshPromise: Promise<void> | null = null

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
        if (refreshPromise) return refreshPromise

        const { auth } = get()

        refreshPromise = (async () => {
          try {
            const response = await fetch(`${env.VITE_API_BASE_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.accessToken}`
              }
            })

            if (!response.ok) throw new Error('Refresh failed')

            const data = await response.json()

            if (data.token) {
              auth.setAccessToken(data.token)

              // Proactive business validation right after refresh
              try {
                const decoded: any = jwtDecode(data.token)
                if (!decoded.businessId && decoded.role === 'Admin') {
                  console.warn('No business found in token for Admin, redirecting...')
                  window.location.href = '/configurar-cuenta'
                }
              } catch (e) {
                console.error('Error decoding token after refresh', e)
              }
            }
            if (data.user) {
              auth.setUser(data.user)
            }
          } catch (error) {
            console.error('Failed to refresh token', error)
            auth.reset()
            throw error
          } finally {
            refreshPromise = null
          }
        })()

        return refreshPromise
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
