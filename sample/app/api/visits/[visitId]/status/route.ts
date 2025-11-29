import { NextRequest } from "next/server";

import { changeVisitStatus } from "@/lib/services/visits.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

type RouteContext = { params: Promise<{ visitId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("visits:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const { visitId } = await context.params;
    const visit = await changeVisitStatus(visitId, payload);
    return successResponse(visit, "وضعیت ویزیت با موفقیت تغییر کرد.");
  } catch (error) {
    return handleApiError(error);
  }
}

