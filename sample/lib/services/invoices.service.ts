import { ObjectId } from "mongodb";
import type { Filter } from "mongodb";
import { z } from "zod";

import { invoicesRepository } from "@/lib/repositories";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  marketerId?: string;
  marketerName?: string;
  status: InvoiceStatus;
  issuedAt: Date;
  dueAt: Date;
  grandTotal: number;
  currency: "IRR" | "USD";
  paidAt?: Date;
};

export type InvoiceDetail = Invoice & {
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  customerAddress?: string;
  marketerName?: string;
};

export type InvoiceListFilters = {
  status?: InvoiceStatus;
  customerId?: string;
  marketerId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

const invoiceLineItemSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(1, "عنوان آیتم الزامی است"),
  quantity: z.coerce.number().min(0.01, "تعداد باید بیشتر از صفر باشد"),
  unit: z.string().min(1, "واحد الزامی است"),
  unitPrice: z.coerce.number().min(0, "قیمت واحد باید مثبت باشد"),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
});

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "مشتری الزامی است"),
  marketerId: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).default("DRAFT"),
  issuedAt: z.coerce.date().default(new Date()),
  dueAt: z.coerce.date(),
  currency: z.enum(["IRR", "USD"]).default("IRR"),
  items: z.array(invoiceLineItemSchema).min(1, "حداقل یک آیتم لازم است"),
  paymentReference: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const updateInvoiceSchema = z
  .object({
    customerId: z.string().optional(),
    marketerId: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
    issuedAt: z.coerce.date().optional(),
    dueAt: z.coerce.date().optional(),
    currency: z.enum(["IRR", "USD"]).optional(),
    items: z.array(invoiceLineItemSchema).optional(),
    paymentReference: z.string().optional().nullable(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

/**
 * محاسبه خودکار مبالغ پیش‌فاکتور
 */
export function calculateInvoiceTotal(items: Array<{
  unitPrice: number;
  quantity: number;
  discount?: number;
  taxRate?: number;
}>): {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const itemSubtotal = item.unitPrice * item.quantity;
    const itemDiscount = item.discount || 0;
    const itemAfterDiscount = itemSubtotal - itemDiscount;
    const itemTax = itemAfterDiscount * ((item.taxRate || 0) / 100);

    subtotal += itemSubtotal;
    discountTotal += itemDiscount;
    taxTotal += itemTax;
  }

  const grandTotal = subtotal - discountTotal + taxTotal;

  return {
    subtotal: Math.round(subtotal),
    taxTotal: Math.round(taxTotal),
    discountTotal: Math.round(discountTotal),
    grandTotal: Math.round(grandTotal),
  };
}

/**
 * تولید شماره پیش‌فاکتور
 */
function generateInvoiceNumber(): string {
  const prefix = "INV";
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${month}-${random}`;
}

/**
 * لیست پیش‌فاکتورها با فیلتر و Pagination
 */
export async function listInvoices(
  filters: InvoiceListFilters = {},
): Promise<{ data: InvoiceSummary[]; total: number; page: number; limit: number }> {
  const query: Filter<Invoice> = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.customerId) {
    query.customerId = filters.customerId;
  }

  if (filters.marketerId) {
    query.marketerId = filters.marketerId;
  }

  if (filters.startDate || filters.endDate) {
    query.issuedAt = {};
    if (filters.startDate) {
      query.issuedAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.issuedAt.$lte = filters.endDate;
    }
  }

  const [invoices, total] = await Promise.all([
    invoicesRepository.findMany(query, { sort: { issuedAt: -1 }, skip, limit }),
    invoicesRepository.count(query),
  ]);

  // برای نمایش نام مشتری و بازاریاب، باید از جداول مربوطه fetch کنیم
  // invoice.customerId و invoice.marketerId از نوع string هستند (طبق interface)
  const customerIds = Array.from(
    new Set(invoices.map((inv) => inv.customerId).filter(Boolean) as string[]),
  );
  const marketerIds = Array.from(
    new Set(invoices.map((inv) => inv.marketerId).filter(Boolean) as string[]),
  );

  const { getCustomersCollection } = await import("@/lib/db");
  const { getUsersCollection } = await import("@/lib/db");
  const customersCollection = await getCustomersCollection();
  const usersCollection = await getUsersCollection();

  // تلاش برای پیدا کردن مشتری‌ها با استفاده از ObjectId و string
  const customers: Array<{ _id: any; displayName: string }> = [];
  if (customerIds.length > 0) {
    // تلاش اول: با ObjectId
    try {
      const customersWithObjectId = await customersCollection
        .find({ _id: { $in: customerIds.map((id) => new ObjectId(id)) } as any })
        .toArray();
      customers.push(...customersWithObjectId);
    } catch (error) {
      console.warn("[listInvoices] Error finding customers with ObjectId:", error);
    }

    // تلاش دوم: با string (برای مشتری‌هایی که پیدا نشدند)
    const foundIds = new Set(customers.map((c) => c._id.toString()));
    const missingIds = customerIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      try {
        const customersWithString = await customersCollection
          .find({ _id: { $in: missingIds } as any })
          .toArray();
        customers.push(...customersWithString);
      } catch (error) {
        console.warn("[listInvoices] Error finding customers with string:", error);
      }
    }
  }

  // تلاش برای پیدا کردن بازاریاب‌ها
  const marketers: Array<{ _id: any; fullName?: string }> = [];
  if (marketerIds.length > 0) {
    try {
      const marketersWithObjectId = await usersCollection
        .find({ _id: { $in: marketerIds.map((id) => new ObjectId(id)) } as any })
        .toArray();
      marketers.push(...marketersWithObjectId);
    } catch (error) {
      console.warn("[listInvoices] Error finding marketers with ObjectId:", error);
    }

    const foundMarketerIds = new Set(marketers.map((m) => m._id.toString()));
    const missingMarketerIds = marketerIds.filter((id) => !foundMarketerIds.has(id));
    if (missingMarketerIds.length > 0) {
      try {
        const marketersWithString = await usersCollection
          .find({ _id: { $in: missingMarketerIds } as any })
          .toArray();
        marketers.push(...marketersWithString);
      } catch (error) {
        console.warn("[listInvoices] Error finding marketers with string:", error);
      }
    }
  }

  // ساخت map با استفاده از string برای هر دو طرف
  const customerMap = new Map<string, string>();
  customers.forEach((c) => {
    const id = c._id.toString();
    customerMap.set(id, c.displayName);
    // همچنین با customerId که ممکن است string باشد (برای اطمینان)
    // اما Customer interface ندارد customerId، پس فقط _id را استفاده می‌کنیم
  });

  const marketerMap = new Map<string, string>();
  marketers.forEach((m) => {
    const id = m._id.toString();
    marketerMap.set(id, m.fullName || "بازاریاب ناشناس");
  });

  const data: InvoiceSummary[] = invoices.map((invoice) => {
    // invoice.customerId و invoice.marketerId از نوع string هستند (طبق interface)
    const customerIdStr = invoice.customerId || "";
    const marketerIdStr = invoice.marketerId || undefined;

    // پیدا کردن نام مشتری
    // تلاش با customerIdStr مستقیم
    let customerName = customerMap.get(customerIdStr);
    
    // اگر پیدا نشد، تلاش با تبدیل به ObjectId و سپس string
    if (!customerName && customerIdStr) {
      try {
        const objectIdStr = new ObjectId(customerIdStr).toString();
        customerName = customerMap.get(objectIdStr);
      } catch (error) {
        // ignore - ممکن است customerIdStr خودش ObjectId string باشد
      }
    }
    
    // اگر هنوز پیدا نشد، از "مشتری ناشناس" استفاده می‌کنیم
    customerName = customerName || "مشتری ناشناس";
    
    // لاگ برای دیباگ (فقط در صورت نیاز)
    if (customerName === "مشتری ناشناس" && customerIdStr) {
      console.warn(`[listInvoices] Customer not found for ID: ${customerIdStr}`, {
        customerIdStr,
        availableIds: Array.from(customerMap.keys()).slice(0, 5), // فقط 5 تا اول برای لاگ
        invoiceId: invoice._id,
      });
    }

    return {
      id: invoice._id.toString(),
      invoiceNumber: (invoice.meta?.invoiceNumber as string) || invoice._id.toString(),
      customerId: customerIdStr,
      customerName,
      marketerId: marketerIdStr,
      marketerName: marketerIdStr ? (marketerMap.get(marketerIdStr) || undefined) : undefined,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      grandTotal: invoice.grandTotal,
      currency: invoice.currency,
      paidAt: invoice.paidAt,
    };
  });

  return { data, total, page, limit };
}

/**
 * دریافت جزئیات یک پیش‌فاکتور
 */
export async function getInvoiceById(invoiceId: string): Promise<InvoiceDetail | null> {
  const invoice = await invoicesRepository.findById(invoiceId);
  if (!invoice) {
    return null;
  }

  // دریافت نام مشتری و بازاریاب
  const { getCustomersCollection } = await import("@/lib/db");
  const { getUsersCollection } = await import("@/lib/db");
  const customersCollection = await getCustomersCollection();
  const usersCollection = await getUsersCollection();

  // تلاش برای پیدا کردن مشتری با استفاده از customerId
  // ممکن است customerId به صورت string یا ObjectId باشد
  let customer = null;
  try {
    // ابتدا تلاش می‌کنیم با ObjectId
    customer = await customersCollection.findOne({ _id: new ObjectId(invoice.customerId) } as any);
  } catch (error) {
    // اگر خطا داد، ممکن است customerId خودش ObjectId باشد
    console.error("[getInvoiceById] Error finding customer with ObjectId:", error);
  }

  // اگر پیدا نشد، تلاش می‌کنیم با string
  if (!customer) {
    try {
      customer = await customersCollection.findOne({ _id: invoice.customerId } as any);
    } catch (error) {
      console.error("[getInvoiceById] Error finding customer with string:", error);
    }
  }

  const marketer = invoice.marketerId
    ? await usersCollection.findOne({ _id: new ObjectId(invoice.marketerId) } as any)
    : null;

  return {
    ...invoice,
    customerName: customer?.displayName || undefined,
    customerPhone: customer?.contact?.phone || undefined,
    customerCity: customer?.contact?.city || undefined,
    customerAddress: customer?.contact?.address || undefined,
    marketerName: marketer?.fullName || undefined,
  };
}

/**
 * ایجاد پیش‌فاکتور جدید
 */
export async function createInvoice(payload: unknown): Promise<Invoice> {
  const validated = createInvoiceSchema.parse(payload);

  // محاسبه مبالغ
  const totals = calculateInvoiceTotal(validated.items);

  // تولید شماره پیش‌فاکتور
  const invoiceNumber = generateInvoiceNumber();

  const now = new Date();
  const invoice: Invoice = {
    _id: new ObjectId().toHexString(),
    customerId: validated.customerId,
    marketerId: validated.marketerId,
    status: validated.status,
    issuedAt: validated.issuedAt,
    dueAt: validated.dueAt,
    currency: validated.currency,
    items: validated.items.map((item) => ({
      ...item,
      total: item.unitPrice * item.quantity - (item.discount || 0),
    })),
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    discountTotal: totals.discountTotal,
    grandTotal: totals.grandTotal,
    paymentReference: validated.paymentReference,
    paidAt: undefined,
    createdAt: now,
    createdBy: "system",
    updatedAt: now,
    updatedBy: "system",
    meta: {
      ...validated.meta,
      invoiceNumber,
    },
  };

  const created = await invoicesRepository.insertOne(invoice as never);
  return created as Invoice;
}

/**
 * به‌روزرسانی پیش‌فاکتور
 */
export async function updateInvoice(invoiceId: string, payload: unknown): Promise<Invoice> {
  const validated = updateInvoiceSchema.parse(payload);

  const existing = await invoicesRepository.findById(invoiceId);
  if (!existing) {
    throw new Error("پیش‌فاکتور یافت نشد.");
  }

  const updateData: Partial<Invoice> = {
    updatedAt: new Date(),
  };

  if (validated.customerId !== undefined) {
    updateData.customerId = validated.customerId;
  }

  if (validated.marketerId !== undefined) {
    updateData.marketerId = validated.marketerId || undefined;
  }

  if (validated.status !== undefined) {
    updateData.status = validated.status;
  }

  if (validated.issuedAt !== undefined) {
    updateData.issuedAt = validated.issuedAt;
  }

  if (validated.dueAt !== undefined) {
    updateData.dueAt = validated.dueAt;
  }

  if (validated.currency !== undefined) {
    updateData.currency = validated.currency;
  }

  if (validated.items !== undefined) {
    // محاسبه مجدد مبالغ
    const totals = calculateInvoiceTotal(validated.items);
    updateData.items = validated.items.map((item) => ({
      ...item,
      total: item.unitPrice * item.quantity - (item.discount || 0),
    }));
    updateData.subtotal = totals.subtotal;
    updateData.taxTotal = totals.taxTotal;
    updateData.discountTotal = totals.discountTotal;
    updateData.grandTotal = totals.grandTotal;
  }

  if (validated.paymentReference !== undefined) {
    updateData.paymentReference = validated.paymentReference || undefined;
  }

  if (validated.meta !== undefined) {
    updateData.meta = { ...existing.meta, ...validated.meta };
  }

  const updated = await invoicesRepository.updateById(invoiceId, updateData);
  if (!updated) {
    throw new Error("خطا در به‌روزرسانی پیش‌فاکتور.");
  }

  const result = await getInvoiceById(invoiceId);
  if (!result) {
    throw new Error("پیش‌فاکتور یافت نشد.");
  }

  return result;
}

/**
 * تغییر وضعیت پیش‌فاکتور
 */
export async function changeInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  paidAt?: Date,
  paymentReference?: string,
): Promise<Invoice> {
  const updateData: Partial<Invoice> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "PAID") {
    if (paidAt) {
      updateData.paidAt = paidAt;
    }
    if (paymentReference !== undefined) {
      updateData.paymentReference = paymentReference || undefined;
    }
  } else {
    // برای وضعیت‌های غیر از PAID، paidAt را پاک می‌کنیم
    updateData.paidAt = undefined;
  }

  const updated = await invoicesRepository.updateById(invoiceId, updateData);
  if (!updated) {
    throw new Error("خطا در تغییر وضعیت پیش‌فاکتور.");
  }

  const result = await getInvoiceById(invoiceId);
  if (!result) {
    throw new Error("پیش‌فاکتور یافت نشد.");
  }

  return result;
}

/**
 * علامت‌گذاری به عنوان پرداخت شده
 */
export async function markInvoiceAsPaid(invoiceId: string, paidAt = new Date()): Promise<Invoice> {
  return changeInvoiceStatus(invoiceId, "PAID", paidAt);
}

/**
 * حذف پیش‌فاکتور
 */
export async function deleteInvoice(invoiceId: string): Promise<boolean> {
  return invoicesRepository.deleteById(invoiceId);
}

