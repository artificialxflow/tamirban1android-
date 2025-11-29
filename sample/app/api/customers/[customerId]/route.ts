import { NextRequest, NextResponse } from "next/server";

import { deleteCustomer, getCustomerDetail, updateCustomer } from "@/lib/services/customers.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";

type RouteContext = { params: Promise<{ customerId: string }> };

async function getHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("customers:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { customerId } = await context.params;
    const customer = await getCustomerDetail(customerId);
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "مشتری یافت نشد.",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return successResponse(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

async function patchHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("customers:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const { customerId } = await context.params;
    const customer = await updateCustomer(customerId, payload);
    return successResponse(customer, "مشتری با موفقیت به‌روزرسانی شد.");
  } catch (error) {
    return handleApiError(error);
  }
}

async function deleteHandler(request: NextRequest, context: RouteContext) {
  const permissionResult = await requirePermission("customers:delete")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { customerId } = await context.params;
    await deleteCustomer(customerId);
    return successResponse(null, "مشتری با موفقیت حذف شد.");
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


