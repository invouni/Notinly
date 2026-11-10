import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { signOut } from "firebase/auth"
import { auth } from "@/config/firebase"

import {
  getCurrentUser,
  logoutBackend,
} from "@/services/api"

export type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore the session using the backend cookie.
  const refreshUser = useCallback(async () => {
    try {
      const data = await getCurrentUser()
      const currentUser: AuthUser | null = data?.user ?? null

      setUser(currentUser)

      return currentUser
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Check for an existing session when the app starts.
  useEffect(() => {
    void refreshUser().catch((error) => {
      console.error("Session restoration failed:", error)
    })
  }, [refreshUser])

  // Clear backend and Firebase sessions.
  const logout = async () => {
    let backendError: unknown

    try {
      await logoutBackend()
    } catch (error) {
      backendError = error
    }

    try {
      await signOut(auth)
    } finally {
      setUser(null)
    }

    if (backendError) {
      throw backendError
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}