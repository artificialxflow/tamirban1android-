import { NextRequest, NextResponse } from "next/server";

import { getOtpAttemptsCollection } from "@/lib/db/collections";

/**
 * Rate Limiter ساده با استفاده از MongoDB
 * در production بهتر است از Redis استفاده شود
 */
export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // میلی‌ثانیه
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Rate Limiter برای OTP
 */
export async function rateLimitOTP(phone: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const maxRequests = 5; // حداکثر 5 درخواست
  const windowMs = 60 * 60 * 1000; // 1 ساعت

  const otpAttemptsCollection = await getOtpAttemptsCollection();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // شمارش درخواست‌های OTP در بازه زمانی
  const count = await otpAttemptsCollection.countDocuments({
    phoneNumber: phone,
    createdAt: { $gte: windowStart },
  });

  const remaining = Math.max(0, maxRequests - count);
  const resetAt = new Date(now.getTime() + windowMs);

  return {
    allowed: count < maxRequests,
    remaining,
    resetAt,
  };
}

/**
 * Rate Limiter عمومی برای API endpoints
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = options.keyGenerator
    ? options.keyGenerator(request)
    : request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  const now = Date.now();
  const stored = rateLimitStore.get(key);

  // پاک کردن رکوردهای منقضی شده
  if (stored && stored.resetAt < now) {
    rateLimitStore.delete(key);
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    // ایجاد رکورد جدید
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: new Date(now + options.windowMs),
    };
  }

  if (current.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(current.resetAt),
    };
  }

  // افزایش شمارنده
  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: options.maxRequests - current.count,
    resetAt: new Date(current.resetAt),
  };
}

/**
 * Middleware برای Rate Limiting
 */
export function withRateLimit(options: RateLimitOptions) {
  return async (request: NextRequest): Promise<
    | { success: true }
    | { success: false; response: NextResponse }
  > => {
    const result = await rateLimit(request, options);

    if (!result.allowed) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
            code: "RATE_LIMIT_EXCEEDED",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": options.maxRequests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetAt.getTime().toString(),
              "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
            },
          },
        ),
      };
    }

    return { success: true };
  };
}

