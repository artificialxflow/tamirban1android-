import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "./auth";
import { getUsersCollection } from "@/lib/db/collections";
import type { RoleKey } from "@/lib/types";
import { errorResponse, ApiErrorCode } from "@/lib/utils/errors";
import { ROLE_PERMISSIONS } from "@/lib/permissions/role-permissions";

/**
 * بررسی دسترسی کاربر به یک permission
 */
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ _id: userId, isActive: true });

  if (!user) {
    return false;
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Middleware برای بررسی نقش کاربر
 */
export function requireRole(...allowedRoles: RoleKey[]) {
  return async (request: NextRequest): Promise<
    | { success: true; user: { id: string; role: RoleKey } }
    | { success: false; response: NextResponse }
  > => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult;
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ _id: authResult.user.sub, isActive: true });

    if (!user) {
      return {
        success: false,
        response: errorResponse("کاربر یافت نشد یا غیرفعال است.", ApiErrorCode.NOT_FOUND, 404),
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        success: false,
        response: errorResponse(
          "شما دسترسی لازم برای این عملیات را ندارید.",
          ApiErrorCode.FORBIDDEN,
          403,
        ),
      };
    }

    return {
      success: true,
      user: { id: user._id, role: user.role },
    };
  };
}

/**
 * Middleware برای بررسی permission
 */
export function requirePermission(permission: string) {
  return async (request: NextRequest): Promise<
    | { success: true; user: { id: string; role: RoleKey } }
    | { success: false; response: NextResponse }
  > => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult;
    }

    const hasPermission = await checkPermission(authResult.user.sub, permission);

    if (!hasPermission) {
      return {
        success: false,
        response: errorResponse(
          "شما دسترسی لازم برای این عملیات را ندارید.",
          ApiErrorCode.FORBIDDEN,
          403,
        ),
      };
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ _id: authResult.user.sub });

    if (!user) {
      return {
        success: false,
        response: errorResponse("کاربر یافت نشد.", ApiErrorCode.NOT_FOUND, 404),
      };
    }

    return {
      success: true,
      user: { id: user._id, role: user.role },
    };
  };
}

