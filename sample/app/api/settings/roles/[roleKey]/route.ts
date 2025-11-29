import { NextRequest } from "next/server";

import { rolesService } from "@/lib/services/roles.service";
import { requireRole } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { RoleKey } from "@/lib/types";

/**
 * GET /api/settings/roles/[roleKey]
 * دریافت اطلاعات یک نقش
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
    const role = await rolesService.getRole(roleKey as RoleKey);

    if (!role) {
      return successResponse(null, "نقش یافت نشد.", 404);
    }

    return successResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

