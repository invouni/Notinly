
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  reload,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"

import { auth } from "@/config/firebase"

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  await updateProfile(credential.user, {
    displayName: name,
  })

  await sendEmailVerification(credential.user)

  await signOut(auth)

  return {
    message: "Verification email sent. Please verify your account.",
  }
}

export const loginUser = async (
  email: string,
  password: string
) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )

  await reload(credential.user)

  if (!credential.user.emailVerified) {
    await signOut(auth)
    throw new Error("Please verify your email before logging in.")
  }

  return credential.user
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  provider.setCustomParameters({
    prompt: "select_account",
  })

  const result = await signInWithPopup(auth, provider)

  return result.user
}