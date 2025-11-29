import { NextRequest, NextResponse } from "next/server";

import { verifyJwt } from "@/lib/utils/jwt";
import type { AuthTokenPayload } from "@/lib/types";

export type AuthenticatedRequest = NextRequest & {
  user?: AuthTokenPayload;
};

/**
 * استخراج JWT از هدر Authorization
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  // فرمت: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Middleware برای بررسی و اعتبارسنجی JWT
 * این middleware توکن را از هدر Authorization استخراج می‌کند و payload را به request اضافه می‌کند
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<{ success: true; user: AuthTokenPayload } | { success: false; response: NextResponse }> {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: "توکن احراز هویت ارسال نشده است.",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      ),
    };
  }

  try {
    const payload = verifyJwt(token);
    return { success: true, user: payload };
  } catch (error) {
    const isExpired = error instanceof Error && error.message.includes("expired");
    
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: isExpired ? "توکن منقضی شده است. لطفاً دوباره وارد شوید." : "توکن نامعتبر است.",
          code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
        },
        { status: 401 },
      ),
    };
  }
}

/**
 * Wrapper برای Route Handlers که نیاز به احراز هویت دارند
 */
export function withAuth<T = unknown>(
  handler: (request: NextRequest, context: { user: AuthTokenPayload } & T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult.response;
    }

    return handler(request, { ...context, user: authResult.user } as { user: AuthTokenPayload } & T);
  };
}

