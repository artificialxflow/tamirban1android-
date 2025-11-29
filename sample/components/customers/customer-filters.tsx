"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import type { CustomerStatus } from "@/lib/types";
import { CUSTOMER_STATUSES } from "@/lib/types";

const STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  PENDING: "در انتظار پیگیری",
  AT_RISK: "احتمال ریزش",
  LOYAL: "مشتری وفادار",
  SUSPENDED: "متوقف شده",
};

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<CustomerStatus | "all">(
    (searchParams.get("status") as CustomerStatus) || "all"
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [marketerId, setMarketerId] = useState(searchParams.get("marketerId") || "");

  // به‌روزرسانی URL با تغییر فیلترها
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (city) params.set("city", city);
    if (marketerId) params.set("marketerId", marketerId);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/customers${newUrl}`, { scroll: false });
  }, [search, status, city, marketerId, router]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6">
      <header className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-sm font-semibold text-slate-800">فیلترها و جستجو</h3>
        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
            setCity("");
            setMarketerId("");
          }}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          پاک کردن همه
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* جستجو */}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          جستجو
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="نام، شماره تماس، کد..."
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        {/* فیلتر وضعیت */}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          وضعیت
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus | "all")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">همه</option>
            {CUSTOMER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        {/* فیلتر شهر */}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          شهر
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="مثال: تهران"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        {/* فیلتر بازاریاب */}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          بازاریاب
          <input
            type="text"
            value={marketerId}
            onChange={(e) => setMarketerId(e.target.value)}
            placeholder="شناسه بازاریاب"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>
      </div>
    </div>
  );
}

