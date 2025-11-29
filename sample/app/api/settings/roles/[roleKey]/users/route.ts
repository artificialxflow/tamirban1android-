import { NextRequest } from "next/server";

import { rolesService } from "@/lib/services/roles.service";
import { requireRole } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { RoleKey } from "@/lib/types";

/**
 * GET /api/settings/roles/[roleKey]/users
 * دریافت لیست کاربران یک نقش
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleKey: string }> },
) {
  const roleResult = await requireRole("SUPER_ADMIN")(request);
  if (!roleResult.success) {
    return roleResult.response;
  }

  try {
    const { roleKey } = await params;
    const users = await rolesService.getRoleUsers(roleKey as RoleKey);

    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

