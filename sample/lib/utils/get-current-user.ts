import { headers } from "next/headers";
import { verifyJwt } from "./jwt";
import { getUsersCollection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/types";

/**
 * دریافت اطلاعات کاربر فعلی در Server Component
 * از Authorization header تلاش می‌کند
 * توجه: این تابع فقط در صورتی کار می‌کند که token در Authorization header ارسال شده باشد
 */
export async function getCurrentUser(): Promise<{ id: string; role: string } | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    if (!token) {
      return null;
    }

    // Verify token
    const payload = verifyJwt(token) as AuthTokenPayload;
    if (!payload?.sub) {
      return null;
    }

    // دریافت اطلاعات کامل کاربر از دیتابیس
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne(
      { _id: payload.sub, isActive: true },
      { projection: { _id: 1, role: 1 } }
    );

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      role: user.role,
    };
  } catch {
    return null;
  }
}

