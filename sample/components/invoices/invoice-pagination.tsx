"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface InvoicePaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function InvoicePagination({ total, page, limit }: InvoicePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);
  const numberFormatter = new Intl.NumberFormat("fa-IR");

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-xs text-slate-500">
      <span>
        نمایش {numberFormatter.format(startItem)} تا {numberFormatter.format(endItem)} از{" "}
        {numberFormatter.format(total)} پیش‌فاکتور
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full border-2 border-primary-300 bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          قبلی
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                style={page === pageNum ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' } : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  page === pageNum
                    ? "text-white shadow-md shadow-blue-500/20"
                    : "border-2 border-primary-300 bg-primary-100 text-primary-800 hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
                }`}
              >
                {numberFormatter.format(pageNum)}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-full border-2 border-primary-300 bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          بعدی
        </button>
      </div>
    </footer>
  );
}

