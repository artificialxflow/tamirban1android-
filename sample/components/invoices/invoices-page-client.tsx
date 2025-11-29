"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { InvoiceList } from "./invoice-list";
import { InvoiceFilters } from "./invoice-filters";
import { InvoicePagination } from "./invoice-pagination";
import { InvoiceCreateModal } from "./invoice-create-modal";
import type { InvoiceSummary } from "@/lib/services/invoices.service";

interface InvoicesPageClientProps {
  initialInvoices: InvoiceSummary[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  stats: Array<{
    title: string;
    value: string;
    helper: string;
    helperColor: string;
  }>;
  customers: Array<{ id: string; name: string }>;
  marketers: Array<{ id: string; name: string }>;
}

export function InvoicesPageClient({
  initialInvoices,
  initialTotal,
  initialPage,
  initialLimit,
  stats,
  customers,
  marketers,
}: InvoicesPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <AppShell
        title="مدیریت پیش‌فاکتورها"
        description="لیست پیش‌فاکتورهای صادر شده، وضعیت پرداخت و پیش‌نمایش PDF."
        activeHref="/dashboard/invoices"
        actions={
          <>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
            >
              ایجاد پیش‌فاکتور جدید
            </button>
          </>
        }
        toolbar={
          <div className="flex flex-col gap-3">
            <InvoiceFilters />
            <div className="grid gap-3 md:grid-cols-4">
              {stats.map((card) => (
                <article key={card.title} className="rounded-2xl border border-slate-200/60 bg-slate-50/50 px-5 py-4 transition hover:bg-slate-50 hover:shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.title}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{card.value}</p>
                  <p className={`mt-1 text-[11px] ${card.helperColor}`}>{card.helper}</p>
                </article>
              ))}
            </div>
          </div>
        }
      >
        <section className="rounded-3xl border border-slate-200/60 bg-slate-50/50">
          <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">لیست پیش‌فاکتورها</h2>
              <p className="text-xs text-slate-500">
                {initialTotal > 0 ? `${initialTotal} پیش‌فاکتور` : "هیچ پیش‌فاکتوری ثبت نشده است"}
              </p>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-slate-100 text-right text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-6 py-4">شناسه</th>
                  <th className="px-6 py-4">مشتری</th>
                  <th className="px-6 py-4">مسئول</th>
                  <th className="px-6 py-4">مبلغ</th>
                  <th className="px-6 py-4">وضعیت</th>
                  <th className="px-6 py-4">تاریخ صدور</th>
                  <th className="px-6 py-4">سررسید</th>
                  <th className="px-6 py-4">اقدام</th>
                </tr>
              </thead>
              <InvoiceList invoices={initialInvoices} />
            </table>
          </div>
          <InvoicePagination total={initialTotal} page={initialPage} limit={initialLimit} />
        </section>
      </AppShell>
      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        customers={customers}
        marketers={marketers}
      />
    </>
  );
}

