import { NextRequest, NextResponse } from "next/server";

import { getMarketerDetail, updateMarketer, deleteMarketer } from "@/lib/services/marketers.service";
import { requirePermission, requireRole } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

type RouteContext = { params: Promise<{ marketerId: string }> };

async function getHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("marketers:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { marketerId } = await context.params;
    const marketer = await getMarketerDetail(marketerId);
    if (!marketer) {
      return NextResponse.json(
        {
          success: false,
          message: "بازاریاب یافت نشد.",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return successResponse(marketer);
  } catch (error) {
    return handleApiError(error);
  }
}

async function patchHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("marketers:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const { marketerId } = await context.params;
    const marketer = await updateMarketer(marketerId, payload);
    return successResponse(marketer, "بازاریاب با موفقیت به‌روزرسانی شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

async function deleteHandler(request: NextRequest, context: RouteContext) {
  const roleResult = await requireRole("SUPER_ADMIN")(request);
  if (!roleResult.success) {
    return roleResult.response;
  }

  try {
    const { marketerId } = await context.params;
    await deleteMarketer(marketerId);
    return successResponse(null, "بازاریاب با موفقیت حذف شد.");
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

