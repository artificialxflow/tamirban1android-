import { NextRequest } from "next/server";

import { rolesService } from "@/lib/services/roles.service";
import { requireRole } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

/**
 * GET /api/settings/roles/permissions
 * دریافت لیست تمام permissions موجود در سیستم
 */
export async function GET(request: NextRequest) {
  const roleResult = await requireRole("SUPER_ADMIN")(request);
  if (!roleResult.success) {
    return roleResult.response;
  }

  try {
    const permissions = rolesService.getAllPermissions();
    return successResponse(permissions);
  } catch (error) {
    return handleApiError(error);
  }
}

