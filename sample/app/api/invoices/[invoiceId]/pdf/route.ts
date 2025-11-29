import { NextRequest, NextResponse } from "next/server";

import { getInvoiceById } from "@/lib/services/invoices.service";
import { generateInvoicePDF } from "@/lib/utils/pdf-generator";
import { requirePermission } from "@/lib/middleware/rbac";
import { handleApiError } from "@/lib/utils/errors";

type RouteParams = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const permissionResult = await requirePermission("invoices:read")(request);
  if (!permissionResult.success) {
    return permissionResult.response;
  }

  try {
    const { invoiceId } = await params;
    const invoice = await getInvoiceById(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "پیش‌فاکتور یافت نشد.",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // تولید PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateInvoicePDF(
        invoice,
        invoice.customerName,
        invoice.marketerName,
      );
    } catch (pdfError) {
      console.error("[PDF Route] Error generating PDF:", pdfError);
      return NextResponse.json(
        {
          success: false,
          message: `خطا در تولید PDF: ${pdfError instanceof Error ? pdfError.message : "خطای ناشناخته"}`,
          code: "PDF_GENERATION_ERROR",
        },
        { status: 500 },
      );
    }

    // نام فایل با استفاده از شماره پیش‌فاکتور
    const invoiceNumber = (invoice.meta?.invoiceNumber as string) || invoiceId;
    const filename = `invoice-${invoiceNumber}.pdf`;

    // برگرداندن PDF به عنوان Response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF Route] Unexpected error:", error);
    return handleApiError(error);
  }
}

