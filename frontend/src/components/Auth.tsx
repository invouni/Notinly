import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"

import { ArrowLeft, ArrowRight } from "lucide-react"

type AuthMode = "LOG_IN" | "SIGN_UP"

type Question = {
  key: string
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
    {
      key: "otp",
      heading: "You are there",
      question: "Please enter one time password sent to your email",
      inputType: "text",
      placeholder: "Enter the code",
    },
  ],
}

export default function Auth() {
  const [authState, setAuthState] = useState<AuthMode>("LOG_IN")
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestions = questions[authState]
  const currentQuestion = currentQuestions[step]

  const updateAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
  }

  const changeMode = (mode: AuthMode) => {
    setAuthState(mode)
    setStep(0)
    setAnswers({})
  }

  const handleNext = () => {
    const value = answers[currentQuestion.key]?.trim()

    if (!value) return

    if (currentQuestion.key === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      toast.add({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        type: "error",
      })
      return
    }

    if (currentQuestion.key === "password" && value.length < 8) {
      toast.add({
        title: "Invalid Password",
        description: "Password must be 8 digit.",
        type: "error",
      })
      return
    }

    if (
      currentQuestion.key === "confirmPassword" &&
      value !== answers.password
    ) {
      toast.add({
        title: "Password doesn't match",
        description: "Please type same password again.",
        type: "error",
      })
      return
    }

    if (step < currentQuestions.length - 1) {
      setStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    console.log({
      mode: authState,
      ...answers,
    })

    // Connect backend authentication here later.
  }

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1)
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
            value={answers[currentQuestion.key] || ""}
            onChange={(e) => updateAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNext()
            }}
            autoFocus
            className="h-12"
          />
        </CardContent>

        <CardFooter className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="h-11">
              <ArrowLeft size={16} />
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="h-11 flex-1"
            disabled={!answers[currentQuestion.key]?.trim()}
          >
            {step === currentQuestions.length - 1
              ? authState === "LOG_IN"
                ? "Sign In"
                : "Create Account"
              : "Continue"}
            <ArrowRight size={16} />
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
            className="ml-2 font-medium text-primary hover:underline"
          >
            {authState === "LOG_IN" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </Card>

      {/* Fixed Google sign-in section */}
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
            onClick={() => console.log("Google sign in")}
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
