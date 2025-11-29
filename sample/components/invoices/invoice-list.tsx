"use client";

import { useRouter } from "next/navigation";
import type { InvoiceSummary } from "@/lib/services/invoices.service";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  SENT: "ارسال شده",
  PAID: "پرداخت شد",
  OVERDUE: "معوق",
  CANCELLED: "لغو شد",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border border-slate-200",
  SENT: "bg-primary-100 text-primary-700 border border-primary-200",
  PAID: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  OVERDUE: "bg-orange-100 text-orange-700 border border-orange-200",
  CANCELLED: "bg-rose-100 text-rose-700 border border-rose-200",
};

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: Date) {
  return dateFormatter.format(value);
}

function formatAmount(value: number) {
  return numberFormatter.format(value);
}

interface InvoiceListProps {
  invoices: InvoiceSummary[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const router = useRouter();

  const handleDownloadPDF = async (invoiceId: string) => {
    // دریافت token از localStorage
    const stored = localStorage.getItem("auth_tokens");
    if (!stored) {
      alert("لطفا دوباره وارد شوید");
      return;
    }

    let token: string | null = null;
    try {
      const tokens = JSON.parse(stored);
      token = tokens.accessToken || null;
    } catch {
      alert("لطفا دوباره وارد شوید");
      return;
    }

    if (!token) {
      alert("لطفا دوباره وارد شوید");
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "خطا در دانلود PDF");
      }

      const blob = await response.blob();
      
      // دریافت نام فایل از header یا استفاده از invoiceId
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `invoice-${invoiceId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("خطا در دانلود PDF: " + (error instanceof Error ? error.message : "خطای ناشناخته"));
    }
  };

  return (
    <tbody className="divide-y divide-slate-100 bg-white">
      {invoices.length === 0 ? (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
            هیچ پیش‌فاکتوری یافت نشد
          </td>
        </tr>
      ) : (
        invoices.map((invoice) => (
          <tr key={invoice.id} className="transition hover:bg-primary-50/30">
            <td className="px-6 py-4 text-xs text-slate-400">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{invoice.customerName}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{invoice.marketerName || "-"}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">
              {formatAmount(invoice.grandTotal)} {invoice.currency === "IRR" ? "ریال" : "دلار"}
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_BADGE_CLASS[invoice.status] || STATUS_BADGE_CLASS.DRAFT
                }`}
              >
                {STATUS_LABELS[invoice.status] || invoice.status}
              </span>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500">{formatDate(invoice.issuedAt)}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{formatDate(invoice.dueAt)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(invoice.id)}
                  className="rounded-full border-2 border-primary-300 bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
                >
                  PDF
                </button>
                <button
                  onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  className="rounded-full border-2 border-primary-300 bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
                >
                  باز کردن
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  );
}

