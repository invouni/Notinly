import "dotenv/config"

import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app"

import { getAuth } from "firebase-admin/auth"

const firebaseApp = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: applicationDefault(),
    })

export const adminAuth = getAuth(firebaseApp)

export default firebaseApp