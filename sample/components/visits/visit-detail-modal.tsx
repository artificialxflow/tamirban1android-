"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api-client";
import type { VisitDetail } from "@/lib/services/visits.service";
import { VisitEditModal } from "./visit-edit-modal";
import { ProtectedComponent } from "@/components/common/protected-component";
import { Button } from "@/components/common/button";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "زمان‌بندی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  SCHEDULED: "bg-primary-100 text-primary-700 border border-primary-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border border-rose-200",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "نامشخص";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "نامشخص";
  return dateFormatter.format(date);
}

interface VisitDetailModalProps {
  visitId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VisitDetailModal({ visitId, isOpen, onClose, onSuccess }: VisitDetailModalProps) {
  const router = useRouter();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && visitId) {
      setLoading(true);
      setError(null);
      apiClient
        .get<VisitDetail>(`/visits/${visitId}`)
        .then((response) => {
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
            setVisit(visitData);
          } else {
            setError("خطا در بارگذاری جزئیات ویزیت");
          }
        })
        .catch((err) => {
          console.error("Error loading visit details:", err);
          setError("خطا در بارگذاری جزئیات ویزیت");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setVisit(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, visitId]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="بستن"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <header className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold text-slate-800">جزئیات ویزیت</h2>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        ) : visit ? (
          <div className="space-y-6">
            {/* اطلاعات اصلی */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">مشتری</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{visit.customerName}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">بازاریاب</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{visit.marketerName ?? "نامشخص"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">تاریخ و ساعت برنامه‌ریزی شده</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(visit.scheduledAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">وضعیت</p>
                <p className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[visit.status] ?? "bg-slate-100 text-slate-700"}`}>
                    {STATUS_LABELS[visit.status] ?? visit.status}
                  </span>
                </p>
              </div>
              {visit.completedAt && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">تاریخ تکمیل</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(visit.completedAt)}</p>
                </div>
              )}
            </section>

            {/* موضوعات */}
            {visit.topics && visit.topics.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">موضوعات</h3>
                <div className="flex flex-wrap gap-2">
                  {visit.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-primary-100 border border-primary-200 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* یادداشت */}
            {visit.notes && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">یادداشت</h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {visit.notes}
                </div>
              </section>
            )}

            {/* اقدام پیگیری */}
            {visit.followUpAction && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">اقدام پیگیری</h3>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {visit.followUpAction}
                </div>
              </section>
            )}

            {/* موقعیت مکانی */}
            {visit.locationSnapshot && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">موقعیت مکانی</h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p>
                    <span className="font-medium">عرض جغرافیایی:</span> {visit.locationSnapshot.latitude}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">طول جغرافیایی:</span> {visit.locationSnapshot.longitude}
                  </p>
                  {visit.locationSnapshot.address && (
                    <p className="mt-1">
                      <span className="font-medium">آدرس:</span> {visit.locationSnapshot.address}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* دکمه‌های عملیات */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <ProtectedComponent permission="visits:write">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditModalOpen(true)}
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  >
                    ویرایش
                  </Button>
                </ProtectedComponent>
                <ProtectedComponent permission="visits:delete">
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!confirm("آیا مطمئن هستید که می‌خواهید این ویزیت را حذف کنید؟")) {
                        return;
                      }
                      setIsDeleting(true);
                      try {
                        const response = await apiClient.delete(`/visits/${visitId}`);
                        if (response.success) {
                          onSuccess?.();
                          router.refresh();
                          onClose();
                        } else {
                          alert(response.message || "خطا در حذف ویزیت");
                        }
                      } catch (err) {
                        console.error("Error deleting visit:", err);
                        alert("خطا در حذف ویزیت");
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    isLoading={isDeleting}
                    loadingText="در حال حذف..."
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                  >
                    حذف
                  </Button>
                </ProtectedComponent>
              </div>
              <Button variant="ghost" onClick={onClose}>
                بستن
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      
      {visit && (
        <VisitEditModal
          visit={visit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            // Refresh visit data after edit
            apiClient
              .get<VisitDetail>(`/visits/${visitId}`)
              .then((response) => {
                if (response.success && response.data) {
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
                  setVisit(visitData);
                }
              })
              .catch((err) => {
                console.error("Error refreshing visit:", err);
              });
            onSuccess?.();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

