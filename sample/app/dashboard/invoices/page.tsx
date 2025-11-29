import { InvoicesPageClient } from "@/components/invoices/invoices-page-client";
import { listInvoices } from "@/lib/services/invoices.service";
import { listCustomerSummaries } from "@/lib/services/customers.service";
import { listMarketers } from "@/lib/services/marketers.service";
import type { InvoiceStatus } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("fa-IR");

type InvoicesPageProps = {
  searchParams: Promise<{
    status?: string;
    customerId?: string;
    marketerId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: string;
  }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 20;

  const [invoicesResult, customersResult, marketersResult] = await Promise.all([
    listInvoices({
      status: params.status as InvoiceStatus | undefined,
      customerId: params.customerId,
      marketerId: params.marketerId,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      page,
      limit,
    }),
    listCustomerSummaries({ limit: 1000 }), // برای dropdown
    listMarketers({ limit: 1000 }), // برای dropdown
  ]);

  // محاسبه آمار ساده
  const stats = [
    {
      title: "پیش‌فاکتورهای صادر شده این ماه",
      value: numberFormatter.format(invoicesResult.total),
      helper: "کل پیش‌فاکتورها",
      helperColor: "text-slate-500",
    },
    {
      title: "مجموع مبلغ در انتظار پرداخت",
      value: `${numberFormatter.format(
        invoicesResult.data
          .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
          .reduce((sum, inv) => sum + inv.grandTotal, 0)
      )} ریال`,
      helper: `${invoicesResult.data.filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE").length} فاکتور`,
      helperColor: "text-orange-500",
    },
    {
      title: "پیش‌فاکتورهای پرداخت شده",
      value: numberFormatter.format(invoicesResult.data.filter((inv) => inv.status === "PAID").length),
      helper: "پرداخت شده",
      helperColor: "text-emerald-500",
    },
    {
      title: "پیش‌فاکتورهای معوق",
      value: numberFormatter.format(invoicesResult.data.filter((inv) => inv.status === "OVERDUE").length),
      helper: "نیاز به پیگیری",
      helperColor: "text-rose-500",
    },
  ];

  return (
    <InvoicesPageClient
      initialInvoices={invoicesResult.data}
      initialTotal={invoicesResult.total}
      initialPage={invoicesResult.page}
      initialLimit={invoicesResult.limit}
      stats={stats}
      customers={customersResult.data.map((c) => ({ id: c.id, name: c.name }))}
      marketers={marketersResult.data.map((m) => ({ id: m.id, name: m.fullName }))}
    />
  );
}
