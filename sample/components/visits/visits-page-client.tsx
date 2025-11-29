"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { VisitFilters } from "./visit-filters";
import { VisitList } from "./visit-list";
import { VisitPagination } from "./visit-pagination";
import { VisitCreateModal } from "./visit-create-modal";
import { VisitDetailModal } from "./visit-detail-modal";
import { VisitEditModal } from "./visit-edit-modal";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/utils/api-client";
import type { VisitSummary } from "@/lib/services/visits.service";
import type { VisitDetail } from "@/lib/services/visits.service";
import type { VisitSummaryCard, VisitReminder } from "@/lib/services/visits.service";
import { Button } from "@/components/common/button";

const numberFormatter = new Intl.NumberFormat("fa-IR");

interface VisitsPageClientProps {
  initialVisits: VisitSummary[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  overview: {
    summaryCards: VisitSummaryCard[];
    reminders: VisitReminder[];
  };
}

export function VisitsPageClient({
  initialVisits,
  initialTotal,
  initialPage,
  initialLimit,
  overview,
}: VisitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<VisitDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [visits, setVisits] = useState(initialVisits);
  const [total, setTotal] = useState(initialTotal);

  // به‌روزرسانی state وقتی props تغییر می‌کند
  useEffect(() => {
    setVisits(initialVisits);
    setTotal(initialTotal);
  }, [initialVisits, initialTotal]);

  // اگر کاربر MARKETER است و marketerId در query params نیست، به صورت خودکار اضافه کن
  useEffect(() => {
    if (user?.role === "MARKETER" && !searchParams.get("marketerId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("marketerId", user._id);
      router.replace(`/dashboard/visits?${params.toString()}`);
    }
  }, [user, searchParams, router]);

  const handleSuccess = async () => {
    // بازگشت به صفحه اول و حفظ فیلترها برای نمایش رکورد جدید در بالای لیست
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    
    // Refresh صفحه برای به‌روزرسانی داده‌ها
    router.replace(`/dashboard/visits?${params.toString()}`);
    router.refresh();
  };

  const handleEdit = async (visit: VisitSummary) => {
    try {
      const response = await apiClient.get<VisitDetail>(`/visits/${visit.id}`);
      if (response.success && response.data) {
        // تبدیل تاریخ‌های string به Date
        const visitData = {
          ...response.data,
          scheduledAt: response.data.scheduledAt instanceof Date 
            ? response.data.scheduledAt 
            : new Date(response.data.scheduledAt as string),
          completedAt: response.data.completedAt 
            ? (response.data.completedAt instanceof Date 
                ? response.data.completedAt 
                : new Date(response.data.completedAt as string))
            : null,
        };
        setEditingVisit(visitData);
      }
    } catch (error) {
      console.error("Error loading visit for edit:", error);
      alert("خطا در بارگذاری اطلاعات ویزیت برای ویرایش");
    }
  };

  const handleDelete = async (visitId: string) => {
    setIsDeleting(visitId);
    try {
      const response = await apiClient.delete(`/visits/${visitId}`);
      if (response.success) {
        handleSuccess();
      } else {
        alert(response.message || "خطا در حذف ویزیت");
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      alert("خطا در حذف ویزیت");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <AppShell
        title="برنامه ویزیت‌ها"
        description="مدیریت و ردیابی ویزیت‌های حضوری، وضعیت‌ها و یادداشت‌های تیم بازاریابی."
        activeHref="/dashboard/visits"
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="md"
            className="text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
          >
            ثبت ویزیت جدید
          </Button>
        }
        toolbar={
          <div className="flex flex-col gap-3">
            <VisitFilters />
            <div className="grid gap-3 md:grid-cols-4">
              {overview.summaryCards.map((card) => (
                <article key={card.title} className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">{card.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">{card.value}</p>
                  <p className={`mt-2 text-[11px] ${card.helperColor}`}>{card.helper}</p>
                </article>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr,1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">برنامه زمانی ویزیت‌ها</h2>
                <p className="text-[12px] text-slate-500">
                  {numberFormatter.format(visits.length)} از {numberFormatter.format(total)} مورد
                </p>
              </div>
            </header>
            {visits.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-500 shadow-sm">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">هیچ ویزیتی ثبت نشده است</h3>
                  <p className="mt-1 text-[13px] text-slate-600">برای شروع، گزینه ثبت ویزیت را انتخاب کنید.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
                    ثبت ویزیت جدید
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[720px] divide-y divide-slate-100 text-right text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[12px] font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">تاریخ و ساعت</th>
                        <th className="px-4 py-3">مشتری</th>
                        <th className="px-4 py-3">بازاریاب</th>
                        <th className="px-4 py-3">موضوع</th>
                        <th className="px-4 py-3">وضعیت</th>
                        <th className="px-4 py-3">یادداشت</th>
                        <th className="px-4 py-3 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <VisitList 
                      visits={visits} 
                      onVisitClick={(visitId) => setSelectedVisitId(visitId)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deletingVisitId={isDeleting}
                    />
                  </table>
                </div>
                <div className="lg:hidden">
                  <VisitList
                    visits={visits}
                    onVisitClick={(visitId) => setSelectedVisitId(visitId)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deletingVisitId={isDeleting}
                    variant="cards"
                  />
                </div>
                <VisitPagination total={total} page={initialPage} limit={initialLimit} />
              </>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">یادآوری‌ها و پیگیری‌ها</h2>
                <p className="text-xs text-slate-600">ویزیت‌های آینده و وظایف مرتبط</p>
              </div>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700">افزودن مورد</button>
            </header>
            <ul className="flex flex-col gap-3 text-sm text-slate-700">
              {overview.reminders.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    {item.owner && <span className="text-xs text-slate-500">مسئول: {item.owner}</span>}
                  </div>
                  <span className="text-xs text-orange-500">{item.deadlineLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </AppShell>
      <VisitCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
      {selectedVisitId && (
        <VisitDetailModal
          visitId={selectedVisitId}
          isOpen={!!selectedVisitId}
          onClose={() => setSelectedVisitId(null)}
          onSuccess={() => {
            handleSuccess(); // Refresh the list after edit/delete
          }}
        />
      )}
      {editingVisit && (
        <VisitEditModal
          visit={editingVisit}
          isOpen={!!editingVisit}
          onClose={() => setEditingVisit(null)}
          onSuccess={() => {
            setEditingVisit(null);
            handleSuccess();
          }}
        />
      )}
    </>
  );
}

