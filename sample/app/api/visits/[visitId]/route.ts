import { NextRequest, NextResponse } from "next/server";

import { getVisitDetail, updateVisit, deleteVisit } from "@/lib/services/visits.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

type RouteContext = { params: Promise<{ visitId: string }> };

async function getHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("visits:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { visitId } = await context.params;
    const visit = await getVisitDetail(visitId);
    if (!visit) {
      return NextResponse.json(
        {
          success: false,
          message: "ویزیت یافت نشد.",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return successResponse(visit);
  } catch (error) {
    return handleApiError(error);
  }
}

async function patchHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("visits:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const { visitId } = await context.params;
    const visit = await updateVisit(visitId, payload);
    return successResponse(visit, "ویزیت با موفقیت به‌روزرسانی شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

async function deleteHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("visits:delete")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { visitId } = await context.params;
    await deleteVisit(visitId);
    return successResponse(null, "ویزیت با موفقیت حذف شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return getHandler(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return patchHandler(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return deleteHandler(request, context);
}

