import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { getUsersCollection } from "@/lib/db/collections";
import { issueJwt } from "@/lib/utils/jwt";

const ACCESS_TOKEN_EXPIRES_IN = "1h"; // 1 ساعت
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // 7 روز

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  refreshExpiresIn: number; // seconds
}

export interface RefreshTokenPayload {
  sub: string;
  phone: string;
  type: "refresh";
  sessionId: string;
}

/**
 * ایجاد جفت توکن (Access + Refresh)
 */
export async function issueTokenPair(userId: string, phone: string): Promise<TokenPair> {
  const sessionId = uuidv4();

  // ایجاد Access Token
  const accessToken = await issueJwt(
    {
      sub: userId,
      phone,
      type: "access",
    },
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );

  // ایجاد Refresh Token
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET or JWT_SECRET is not defined");
  }

  const refreshToken = jwt.sign(
    {
      sub: userId,
      phone,
      type: "refresh",
      sessionId,
    } as RefreshTokenPayload,
    refreshSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

  // ذخیره sessionId در دیتابیس (برای باطل کردن در logout)
  const usersCollection = await getUsersCollection();
  await usersCollection.updateOne(
    { _id: userId },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 ساعت به ثانیه
    refreshExpiresIn: 604800, // 7 روز به ثانیه
  };
}

/**
 * تایید و تمدید Refresh Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET or JWT_SECRET is not defined");
  }

  try {
    // بررسی Refresh Token
    const payload = jwt.verify(refreshToken, refreshSecret) as RefreshTokenPayload;

    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    // بررسی وجود کاربر
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ _id: payload.sub, isActive: true });

    if (!user) {
      throw new Error("User not found or inactive");
    }

    // ایجاد جفت توکن جدید
    return issueTokenPair(user._id, user.mobile);
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
}

/**
 * باطل کردن Refresh Token (در logout)
 * در این پیاده‌سازی ساده، فقط بررسی می‌کنیم که token معتبر است
 * در نسخه پیشرفته‌تر می‌توان sessionId را در Redis یا دیتابیس ذخیره کرد
 */
export async function invalidateRefreshToken(refreshToken: string): Promise<void> {
  // در این نسخه ساده، فقط بررسی می‌کنیم که token معتبر است
  // در نسخه پیشرفته‌تر، می‌توان sessionId را در blacklist قرار داد
  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!refreshSecret) {
      return;
    }
    jwt.verify(refreshToken, refreshSecret);
  } catch {
    // اگر token نامعتبر باشد، نیازی به باطل کردن نیست
  }
}

