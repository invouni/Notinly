const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030"

export const createBackendSession = async (idToken: string) => {
  const response = await fetch(`${API_URL}/api/v1/auth/session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to create session")
  }

  return data
}

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    credentials: "include",
  })

  if (!response.ok) return null

  return response.json()
}

export const logoutBackend = async () => {
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to clear backend session")
  }

  return response.json()
}