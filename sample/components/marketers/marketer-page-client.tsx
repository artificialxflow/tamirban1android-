"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { MarketerCreateModal } from "./marketer-create-modal";
import { MarketerEditModal } from "./marketer-edit-modal";
import { MarketerList } from "./marketer-list";
import { MarketerPagination } from "./marketer-pagination";
import type { MarketerSummary } from "@/lib/services/marketers.service";
import { apiClient } from "@/lib/utils/api-client";
import { ProtectedComponent } from "@/components/common/protected-component";

const numberFormatter = new Intl.NumberFormat("fa-IR");

interface MarketerPageClientProps {
  initialMarketers: MarketerSummary[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
}

export function MarketerPageClient({
  initialMarketers,
  initialTotal,
  initialPage,
  initialLimit,
}: MarketerPageClientProps) {
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState<MarketerSummary | null>(null);
  const [marketers, setMarketers] = useState(initialMarketers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  // Update state when props change (e.g., pagination)
  // Use JSON.stringify to detect array changes properly
  useEffect(() => {
    setMarketers(initialMarketers);
    setTotal(initialTotal);
    setPage(initialPage);
  }, [JSON.stringify(initialMarketers.map(m => m.id)), initialTotal, initialPage]);

  const handleRefresh = async () => {
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await apiClient.get<{
        data: MarketerSummary[];
        total: number;
        page: number;
        limit: number;
      }>(`/marketers?${params.toString()}`);
      if (response.success && response.data) {
        setMarketers(response.data.data);
        setTotal(response.data.total);
        setPage(response.data.page);
      }
    } catch (error) {
      console.error("Error refreshing marketers:", error);
      window.location.reload();
    }
  };

  const handleEdit = (marketer: MarketerSummary) => {
    setEditingMarketer(marketer);
  };

  const handleDelete = async (_marketerId: string) => {
    await handleRefresh();
  };

  // Calculate average conversion (based on real data)
  const avgConversion = 0; // Will be calculated from real data when available

  return (
    <>
      <AppShell
        title="مدیریت بازاریاب‌ها"
        description="بررسی عملکرد تیم بازاریابی، وضعیت ویزیت‌ها و تقسیم منطقه‌ای."
        activeHref="/dashboard/marketers"
        actions={
          <>
            <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
              خروجی عملکرد
            </button>
            <ProtectedComponent role="SUPER_ADMIN">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
              >
                افزودن بازاریاب جدید
              </button>
            </ProtectedComponent>
          </>
        }
        toolbar={
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px] md:max-w-sm">
                <input
                  type="search"
                  placeholder="جستجو بر اساس نام، شهر یا مهارت..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                <option value="month">دوره ارزیابی: این ماه</option>
                <option value="quarter">سه ماه اخیر</option>
                <option value="year">سال جاری</option>
              </select>
              <button className="rounded-2xl border-2 border-primary-300 bg-primary-100 px-4 py-3 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
                فیلتر وضعیت
              </button>
            </div>
            <div
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              className="flex items-center justify-between rounded-2xl px-5 py-4 text-sm text-white shadow-lg shadow-blue-500/25"
            >
              <div className="flex flex-col">
                <span className="text-xs text-white/80">میانگین نرخ تبدیل تیم</span>
                <span className="text-2xl font-semibold">{numberFormatter.format(avgConversion)}٪</span>
              </div>
              <div className="text-xs text-white/60 font-medium">داده‌ای موجود نیست</div>
            </div>
          </div>
        }
      >
        {marketers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-800">هیچ بازاریابی ثبت نشده است</h3>
            <p className="mt-2 text-sm text-slate-500">برای شروع، یک بازاریاب جدید ثبت کنید.</p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MarketerList marketers={marketers} onEdit={handleEdit} onDelete={handleDelete} />
            </section>
            <MarketerPagination total={total} page={page} limit={limit} />
          </>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">نمودار عملکرد تیم</h2>
                <p className="text-xs text-slate-500">نمونه بصری برای تایید ساختار داشبورد</p>
              </div>
              <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
                دانلود گزارش
              </button>
            </header>
            <div className="mt-6 h-48 rounded-2xl bg-gradient-to-br from-primary-100 via-white to-primary-50" />
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">تابلوی امتیاز</h2>
                <p className="text-xs text-slate-500">امتیاز ترکیبی براساس KPIهای فاز ۵</p>
              </div>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                مدیریت شاخص‌ها
              </button>
            </header>
            <ul className="flex flex-col gap-3 text-sm text-slate-600">
              {marketers
                .slice(0, 4)
                .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
                .map((marketer, index) => (
                  <li
                    key={marketer.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{marketer.fullName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                        امتیاز {marketer.performanceScore ?? 0}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 bg-slate-900 p-6 text-white shadow-lg">
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">کمپین ویزیت ویژه زمستان</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                کمپین جاری
              </span>
            </header>
            <p className="text-sm text-slate-200">0 مشتری هدف</p>
            <p className="text-xs text-slate-400">کمپین فعالی ثبت نشده است</p>
            <footer className="mt-4 flex items-center gap-3 text-xs text-slate-300">
              <button className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20">
                مشاهده جزئیات
              </button>
              <button className="rounded-full border border-white/20 px-4 py-2 transition hover:bg-white/10">
                ثبت پیشرفت
              </button>
            </footer>
          </article>

          <article className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 bg-slate-900 p-6 text-white shadow-lg">
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">بسته معرفی قطعات مصرفی ۱۴۰۴</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                کمپین جاری
              </span>
            </header>
            <p className="text-sm text-slate-200">0 مشتری ویژه</p>
            <p className="text-xs text-slate-400">کمپین فعالی ثبت نشده است</p>
            <footer className="mt-4 flex items-center gap-3 text-xs text-slate-300">
              <button className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20">
                مشاهده جزئیات
              </button>
              <button className="rounded-full border border-white/20 px-4 py-2 transition hover:bg-white/10">
                ثبت پیشرفت
              </button>
            </footer>
          </article>
        </section>
      </AppShell>
      <MarketerCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />
      {editingMarketer && (
        <MarketerEditModal
          marketer={editingMarketer}
          isOpen={!!editingMarketer}
          onClose={() => setEditingMarketer(null)}
          onSuccess={handleRefresh}
        />
      )}
    </>
  );
}
