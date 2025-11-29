"use server";

import { verifyJwt } from "./jwt";
import type { AuthTokenPayload } from "@/lib/types";

/**
 * دریافت userId از token در Server Actions
 * توجه: این تابع token را به عنوان پارامتر می‌گیرد (نه از headers)
 * چون Server Actions در Next.js 14+ به صورت مستقیم headers را نمی‌گیرند
 */
export async function getUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) {
    return null;
  }

  try {
    const payload = verifyJwt(token);
    return payload.sub || null;
  } catch {
    return null;
  }
}

/**
 * دریافت اطلاعات کاربر از token در Server Actions
 */
export async function getUserFromToken(token: string | null): Promise<AuthTokenPayload | null> {
  if (!token) {
    return null;
  }

  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}

