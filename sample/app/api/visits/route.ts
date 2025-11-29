import { NextRequest } from "next/server";

import { listVisits, createVisit } from "@/lib/services/visits.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { VisitStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const permissionResult = await requirePermission("visits:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      customerId: searchParams.get("customerId") || undefined,
      marketerId: searchParams.get("marketerId") || undefined,
      status: (searchParams.get("status") as VisitStatus | null) || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
    };

    const result = await listVisits(filters);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const permissionResult = await requirePermission("visits:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const visit = await createVisit(payload);
    return successResponse(visit, "ویزیت با موفقیت ثبت شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

