import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const AUTH_TOKEN_KEY = 'haz_factura_token'
const AUTH_USER_KEY = 'haz_factura_user'

interface AuthUser {
  id: string
  nombre: string
  apellidos: string
  imagen: string
  email: string
  business: string,
  workcenter: string,
  role: string
  exp: number,
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
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
