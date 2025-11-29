import { NextRequest, NextResponse } from "next/server";

import { changeInvoiceStatus } from "@/lib/services/invoices.service";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError, successResponse } from "@/lib/utils/errors";
import type { InvoiceStatus } from "@/lib/types";

const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

type RouteParams = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const permissionResult = await requirePermission("invoices:write")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { invoiceId } = await params;
    const payload = await request.json();
    const { status, paidAt, paymentReference } = payload;

    if (!status || !INVOICE_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "وضعیت وارد شده معتبر نیست.",
          code: "VALIDATION_ERROR",
        },
        { status: 422 },
      );
    }

    const invoice = await changeInvoiceStatus(
      invoiceId,
      status as InvoiceStatus,
      paidAt ? new Date(paidAt) : undefined,
      paymentReference,
    );
    return successResponse(invoice, "وضعیت پیش‌فاکتور با موفقیت تغییر کرد.");
  } catch (error) {
    return handleApiError(error);
  }
}

