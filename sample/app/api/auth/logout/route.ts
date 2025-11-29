import { NextRequest } from "next/server";

import { invalidateRefreshToken } from "@/lib/services/auth.service";
import { authenticateRequest } from "@/lib/middleware/auth";
import { handleApiError, successResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    // بررسی احراز هویت (اختیاری - برای ثبت لاگ)
    const authResult = await authenticateRequest(request);
    
    // باطل کردن refresh token اگر ارسال شده باشد
    const body = await request.json().catch(() => ({}));
    const refreshToken = body?.refreshToken as string | undefined;

    if (refreshToken) {
      await invalidateRefreshToken(refreshToken);
    }

    // در اینجا می‌توان لاگ خروج را ثبت کرد
    if (authResult.success) {
      // ثبت لاگ خروج برای کاربر
      console.log(`[Logout] User ${authResult.user.sub} logged out`);
    }

    return successResponse(null, "خروج با موفقیت انجام شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

