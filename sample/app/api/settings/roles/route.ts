import { NextRequest } from "next/server";

import { rolesService } from "@/lib/services/roles.service";
import { requireRole } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

/**
 * GET /api/settings/roles
 * دریافت لیست تمام نقش‌ها با permissions و تعداد کاربران
 */
export async function GET(request: NextRequest) {
  const roleResult = await requireRole("SUPER_ADMIN")(request);
  if (!roleResult.success) {
    return roleResult.response;
  }

  try {
    const roles = await rolesService.listRoles();
    return successResponse(roles);
  } catch (error) {
    return handleApiError(error);
  }
}

