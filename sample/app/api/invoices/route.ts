import { NextRequest, NextResponse } from "next/server";

import {
  listInvoices,
  createInvoice,
} from "@/lib/services/invoices.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { InvoiceStatus } from "@/lib/types";

const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export async function GET(request: NextRequest) {
  const permissionResult = await requirePermission("invoices:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const customerId = searchParams.get("customerId") ?? undefined;
    const marketerId = searchParams.get("marketerId") ?? undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    let status: InvoiceStatus | undefined;
    if (statusParam) {
      if (!INVOICE_STATUSES.includes(statusParam as InvoiceStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "وضعیت وارد شده معتبر نیست.",
            code: "VALIDATION_ERROR",
          },
          { status: 422 },
        );
      }
      status = statusParam as InvoiceStatus;
    }

    const result = await listInvoices({
      status,
      customerId,
      marketerId,
      startDate,
      endDate,
      page,
      limit,
    });
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const permissionResult = await requirePermission("invoices:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const payload = await request.json();
    const invoice = await createInvoice(payload);
    return successResponse(invoice, "پیش‌فاکتور با موفقیت ایجاد شد.", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

