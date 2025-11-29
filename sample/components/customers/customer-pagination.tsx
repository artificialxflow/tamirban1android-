"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const numberFormatter = new Intl.NumberFormat("fa-IR");

interface CustomerPaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function CustomerPagination({ total, page, limit }: CustomerPaginationProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    return `/dashboard/customers${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200/60 bg-slate-50/50 px-6 py-4">
      <div className="text-sm text-slate-600">
        صفحه {numberFormatter.format(page)} از {numberFormatter.format(totalPages)}
      </div>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={createPageUrl(page - 1)}
            className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
          >
            قبلی
          </Link>
        ) : (
          <button
            disabled
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300 cursor-not-allowed"
          >
            قبلی
          </button>
        )}

        {/* نمایش صفحات */}
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
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                style={pageNum === page ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' } : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  pageNum === page
                    ? "text-white shadow-md shadow-blue-500/20"
                    : "text-primary-700 hover:bg-primary-50 border border-primary-200"
                }`}
              >
                {numberFormatter.format(pageNum)}
              </Link>
            );
          })}
        </div>

        {page < totalPages ? (
          <Link
            href={createPageUrl(page + 1)}
            className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
          >
            بعدی
          </Link>
        ) : (
          <button
            disabled
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300 cursor-not-allowed"
          >
            بعدی
          </button>
        )}
      </div>
    </div>
  );
}

