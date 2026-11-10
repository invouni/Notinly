import { Router } from "express";
import { z } from "zod";

import { adminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

const router = Router();

const SESSION_COOKIE = "nz_session";
const SESSION_DURATION = 5 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

// Create session
router.post("/session", async (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid request",
    });
    return;
  }

  const { idToken } = parsed.data;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.email || !decoded.email_verified) {
      res.status(403).json({
        success: false,
        message: "Please use a verified email account.",
      });
      return;
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $set: {
          name: decoded.name || decoded.email.split("@")[0],
          email: decoded.email.toLowerCase(),
        },
        $setOnInsert: {
          firebaseUid: decoded.uid,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        includeResultMetadata: false,
      },
    );

    res.cookie(SESSION_COOKIE, sessionCookie, {
      ...cookieOptions,
      maxAge: SESSION_DURATION,
    });

    res.status(200).json({
      success: true,
      message: "Session created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Session creation failed:", error);

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  const sessionCookie = req.cookies[SESSION_COOKIE];

  if (!sessionCookie) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
    return;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    const user = await User.findOne({
      firebaseUid: decoded.uid,
    }).select("name email");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Session expired or invalid",
    });
  }
});

// Logout
router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
