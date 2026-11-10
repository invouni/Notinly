
import "dotenv/config"

import app from "./app.js"
import connectDB from "./config/db.js"
import { adminAuth } from "./config/firebaseAdmin.js"

const PORT = Number(process.env.PORT) || 3030

const startServer = async () => {
  try {
    await adminAuth.listUsers(1)
    console.log("Firebase Admin connected successfully")

    await connectDB()

    app.listen(PORT, () => {
      console.log(`
  ┌────────────────────────────────────┐
  │       NOTION ZERO BACKEND          │
  ├────────────────────────────────────┤
  │  Status : Running                  │
  │  Port   : ${PORT}                     │
  │  Mode   : ${process.env.NODE_ENV || "development"}             │
  └────────────────────────────────────┘
      `)
    })
  } catch (error) {
    console.error("Server startup failed:", error)
    process.exit(1)
  }
}

startServer()
