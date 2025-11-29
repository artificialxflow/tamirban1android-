"use server";

import { revalidatePath } from "next/cache";
import {
  createInvoice as createInvoiceService,
  updateInvoice as updateInvoiceService,
  deleteInvoice as deleteInvoiceService,
  changeInvoiceStatus as changeInvoiceStatusService,
  listInvoices as listInvoicesService,
  getInvoiceById,
} from "@/lib/services/invoices.service";
import type { InvoiceStatus } from "@/lib/types";

export async function listInvoices(filters: {
  status?: InvoiceStatus;
  customerId?: string;
  marketerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const result = await listInvoicesService({
      status: filters.status,
      customerId: filters.customerId,
      marketerId: filters.marketerId,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      page: filters.page,
      limit: filters.limit,
    });
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در دریافت لیست پیش‌فاکتورها",
      code: "ERROR",
    };
  }
}

export async function getInvoice(invoiceId: string) {
  try {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return { success: false, message: "پیش‌فاکتور یافت نشد", code: "NOT_FOUND" };
    }
    return { success: true, data: invoice };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در دریافت پیش‌فاکتور",
      code: "ERROR",
    };
  }
}

export async function createInvoice(data: {
  customerId: string;
  marketerId?: string;
  status?: InvoiceStatus;
  issuedAt?: string;
  dueAt: string;
  currency?: "IRR" | "USD";
  items: Array<{
    productId?: string;
    title: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }>;
  paymentReference?: string;
}) {
  try {
    const invoice = await createInvoiceService({
      ...data,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
      dueAt: new Date(data.dueAt),
    });
    revalidatePath("/dashboard/invoices");
    return { success: true, data: invoice, message: "پیش‌فاکتور با موفقیت ایجاد شد" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در ایجاد پیش‌فاکتور",
      code: "ERROR",
    };
  }
}

export async function updateInvoice(invoiceId: string, data: Partial<{
  customerId: string;
  marketerId?: string;
  status?: InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  currency?: "IRR" | "USD";
  items: Array<{
    productId?: string;
    title: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }>;
  paymentReference?: string;
}>) {
  try {
    const updateData: any = { ...data };
    if (data.issuedAt) updateData.issuedAt = new Date(data.issuedAt);
    if (data.dueAt) updateData.dueAt = new Date(data.dueAt);

    const invoice = await updateInvoiceService(invoiceId, updateData);
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    return { success: true, data: invoice, message: "پیش‌فاکتور با موفقیت به‌روزرسانی شد" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در به‌روزرسانی پیش‌فاکتور",
      code: "ERROR",
    };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const deleted = await deleteInvoiceService(invoiceId);
    if (!deleted) {
      return { success: false, message: "پیش‌فاکتور یافت نشد", code: "NOT_FOUND" };
    }
    revalidatePath("/dashboard/invoices");
    return { success: true, message: "پیش‌فاکتور با موفقیت حذف شد" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در حذف پیش‌فاکتور",
      code: "ERROR",
    };
  }
}

export async function changeInvoiceStatus(invoiceId: string, status: InvoiceStatus, paidAt?: string) {
  try {
    const invoice = await changeInvoiceStatusService(
      invoiceId,
      status,
      paidAt ? new Date(paidAt) : undefined,
    );
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    return { success: true, data: invoice, message: "وضعیت پیش‌فاکتور با موفقیت تغییر کرد" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در تغییر وضعیت پیش‌فاکتور",
      code: "ERROR",
    };
  }
}

export async function downloadInvoicePDF(invoiceId: string): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${API_BASE_URL}/api/invoices/${invoiceId}/pdf`;
    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطای شبکه",
    };
  }
}

