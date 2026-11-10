import { useState } from "react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { signOut, type User } from "firebase/auth"
import { auth } from "@/config/firebase"
import { createBackendSession } from "@/services/api"
import { useAuth } from "@/context/AuthContext"

import {
  registerUser,
  loginUser,
  loginWithGoogle,
} from "@/services/authService"

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

type AuthMode = "LOG_IN" | "SIGN_UP"

type AuthFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type Question = {
  key: keyof AuthFormData
  heading: string
  question: string
  inputType: string
  placeholder: string
}

const questions: Record<AuthMode, Question[]> = {
  LOG_IN: [
    {
      key: "email",
      heading: "Welcome back",
      question: "What's your email address?",
      inputType: "email",
      placeholder: "you@example.com",
    },
    {
      key: "password",
      heading: "Almost there",
      question: "Enter your password",
      inputType: "password",
      placeholder: "Your password",
    },
  ],

  SIGN_UP: [
    {
      key: "name",
      heading: "Let's get started",
      question: "What should we call you?",
      inputType: "text",
      placeholder: "Your name",
    },
    {
      key: "email",
      heading: "Your account",
      question: "What's your email address?",
      inputType: "email",
      placeholder: "you@example.com",
    },
    {
      key: "password",
      heading: "Secure your account",
      question: "Create a password",
      inputType: "password",
      placeholder: "At least 8 characters",
    },
    {
      key: "confirmPassword",
      heading: "One last thing",
      question: "Confirm your password",
      inputType: "password",
      placeholder: "Enter your password again",
    },
  ],
}

const initialFormData: AuthFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
}

export default function Auth() {
  
  const { refreshUser } = useAuth()
  const [authState, setAuthState] = useState<AuthMode>("LOG_IN")
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const [formData, setFormData] = useState<AuthFormData>(initialFormData)

  const currentQuestions = questions[authState]
  const currentQuestion = currentQuestions[step]

 const establishSession = async (user: User) => {
  try {
    const idToken = await user.getIdToken()

    await createBackendSession(idToken)

    const currentUser = await refreshUser()

    if (!currentUser) {
      throw new Error("Unable to load your user profile.")
    }
  } catch (error) {
    // Best-effort cleanup if session establishment fails.
    try {
      await logoutBackend()
    } catch {
      // Ignore cleanup errors; preserve the original error.
    }

    await signOut(auth)

    throw error
  }
}

  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const changeMode = (mode: AuthMode) => {
    if (isSubmitting) return

    setAuthState(mode)
    setStep(0)
    setFormData({ ...initialFormData })
  }

  const validateField = (key: keyof AuthFormData): boolean => {
    const value = formData[key].trim()

    if (!value) return false

    if (key === "name" && value.length < 2) {
      toast.add({
        title: "Invalid name",
        description: "Name must contain at least 2 characters.",
        type: "error",
      })
      return false
    }

    if (key === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      toast.add({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        type: "error",
      })
      return false
    }

    if (key === "password" && value.length < 8) {
      toast.add({
        title: "Invalid password",
        description: "Password must contain at least 8 characters.",
        type: "error",
      })
      return false
    }

    if (
      key === "confirmPassword" &&
      formData.password !== formData.confirmPassword
    ) {
      toast.add({
        title: "Password doesn't match",
        description: "Please enter the same password again.",
        type: "error",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      if (authState === "SIGN_UP") {
        const result = await registerUser(
          formData.name.trim(),
          formData.email.trim(),
          formData.password
        )

        toast.add({
          title: "Verification email sent",
          description: result.message,
          type: "success",
        })

        // Reset to login after successful registration.
        setAuthState("LOG_IN")
        setStep(0)
        setFormData({ ...initialFormData })

        return
      }

      const user = await loginUser(formData.email.trim(), formData.password)

      await establishSession(user)

      toast.add({
        title: "Login successful",
        description: "Welcome back to NOTION ZERO.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Authentication failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    if (isSubmitting) return

    if (!validateField(currentQuestion.key)) return

    if (step < currentQuestions.length - 1) {
      setStep((prev) => prev + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (isSubmitting) return

    if (step > 0) {
      setStep((prev) => prev - 1)
    }
  }

  const handleGoogleLogin = async () => {
    if (isSubmitting || isGoogleLoading) return

    setIsGoogleLoading(true)

    try {
      const user = await loginWithGoogle()
      await establishSession(user)
      toast.add({
        title: "Google login successful",
        description: `Welcome, ${user.displayName || "back"}!`,
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Google login failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-widest text-primary">
              NOTION ZERO
            </span>

            <span className="text-xs text-muted-foreground">
              {step + 1} / {currentQuestions.length}
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((step + 1) / currentQuestions.length) * 100}%`,
              }}
            />
          </div>

          <CardTitle className="pt-4 text-2xl">
            {currentQuestion.heading}
          </CardTitle>

          <CardDescription>{currentQuestion.question}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Label htmlFor={currentQuestion.key}>
            {currentQuestion.key === "confirmPassword"
              ? "Confirm password"
              : currentQuestion.key.charAt(0).toUpperCase() +
                currentQuestion.key.slice(1)}
          </Label>

          <Input
            id={currentQuestion.key}
            type={currentQuestion.inputType}
            placeholder={currentQuestion.placeholder}
            value={formData[currentQuestion.key]}
            onChange={(e) => handleChange(currentQuestion.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void handleNext()
              }
            }}
            disabled={isSubmitting}
            autoFocus
            autoComplete={
              currentQuestion.key === "email"
                ? "email"
                : currentQuestion.key === "password"
                  ? authState === "LOG_IN"
                    ? "current-password"
                    : "new-password"
                  : currentQuestion.key === "confirmPassword"
                    ? "new-password"
                    : "name"
            }
            className="h-12"
          />
        </CardContent>

        <CardFooter className="flex gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="h-11"
            >
              <ArrowLeft size={16} />
            </Button>
          )}

          <Button
            onClick={() => void handleNext()}
            className="h-11 flex-1"
            disabled={isSubmitting || !formData[currentQuestion.key].trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {step === currentQuestions.length - 1
                  ? authState === "LOG_IN"
                    ? "Sign In"
                    : "Create Account"
                  : "Continue"}

                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </CardFooter>

        <div className="px-6 pb-5 text-center text-sm text-muted-foreground">
          {authState === "LOG_IN"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              changeMode(authState === "LOG_IN" ? "SIGN_UP" : "LOG_IN")
            }
            disabled={isSubmitting}
            className="ml-2 font-medium text-primary hover:underline disabled:opacity-50"
          >
            {authState === "LOG_IN" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </Card>

      {/* Google sign-in section */}
      <div className="fixed bottom-0 left-0 flex w-full justify-center border-t border-border bg-background/95 px-4 py-5 backdrop-blur">
        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs text-muted-foreground">
              OR CONTINUE WITH
            </span>

            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="h-12 w-full gap-3"
            disabled={isSubmitting || isGoogleLoading}
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.01 13.22l7.98 6.19C11.88 13.72 17.45 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.71 7.18l7.19 5.58c4.2-3.87 7.56-9.58 7.56-17.23Z"
              />
              <path
                fill="#FBBC05"
                d="M9.99 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.47 0 11.91-2.13 15.89-5.8l-7.19-5.58c-1.99 1.34-4.53 2.13-8.7 2.13-6.55 0-12.12-4.22-14.01-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
