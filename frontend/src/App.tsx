import Auth from "@/components/Auth"
import Workspace from "@/components/Workspace"

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext"

import { Loader2 } from "lucide-react"

function AppContent() {
  const { user, loading } = useAuth()

  // Wait until the backend session check finishes.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated.
  if (!user) {
    return <Auth />
  }

  // Authenticated.
  return <Workspace />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}