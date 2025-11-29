"use client";

import { useRouter, useSearchParams } from "next/navigation";

const numberFormatter = new Intl.NumberFormat("fa-IR");

interface MarketerPaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function MarketerPagination({ total, page, limit }: MarketerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.push(`/dashboard/marketers?${params.toString()}`, { scroll: false });
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-6 py-4">
      <div className="text-xs text-slate-500">
        صفحه {numberFormatter.format(page)} از {numberFormatter.format(totalPages)} •{" "}
        {numberFormatter.format(total)} بازاریاب
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          قبلی
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}

