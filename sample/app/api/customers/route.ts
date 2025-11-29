import { NextRequest, NextResponse } from "next/server";

import { listCustomerSummaries, createCustomer } from "@/lib/services/customers.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { CustomerStatus } from "@/lib/types";
import { CUSTOMER_STATUSES } from "@/lib/types";

export async function GET(request: NextRequest) {
  const permissionResult = await requirePermission("customers:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const marketerId = searchParams.get("marketerId") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    let status: CustomerStatus | undefined;
    if (statusParam) {
      if (!CUSTOMER_STATUSES.includes(statusParam as CustomerStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "وضعیت وارد شده معتبر نیست.",
            code: "VALIDATION_ERROR",
          },
          { status: 422 },
        );
      }
      status = statusParam as CustomerStatus;
    }

    const result = await listCustomerSummaries({ status, marketerId, search, city, page, limit });
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const permissionResult = await requirePermission("customers:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const customer = await createCustomer(payload);
    return successResponse(customer, "مشتری با موفقیت ثبت شد.", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

