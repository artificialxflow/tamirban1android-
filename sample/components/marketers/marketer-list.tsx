"use client";

import type { MarketerSummary } from "@/lib/services/marketers.service";
import { MarketerDeleteButton } from "./marketer-delete-button";
import { ProtectedComponent } from "@/components/common/protected-component";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value?: Date | null) {
  if (!value) {
    return "نامشخص";
  }
  return dateFormatter.format(value);
}

function getInitials(name: string): string {
  if (!name) {
    return "";
  }
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.toUpperCase();
  return initials || name.substring(0, 2).toUpperCase();
}

function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-primary-100 text-primary-700 border border-primary-200"
    : "bg-slate-200 text-slate-700 border border-slate-300";
}

function getStatusLabel(isActive: boolean) {
  return isActive ? "فعال" : "غیرفعال";
}

interface MarketerListProps {
  marketers: MarketerSummary[];
  onEdit?: (marketer: MarketerSummary) => void;
  onDelete?: (marketerId: string) => void;
}

export function MarketerList({ marketers, onEdit, onDelete }: MarketerListProps) {
  return (
    <>
      {marketers.map((marketer) => (
        <article
          key={marketer.id}
          className="flex min-w-0 flex-col gap-4 rounded-3xl border-2 border-slate-300 bg-white p-4 sm:p-6 shadow-sm transition hover:border-primary-400 hover:shadow-md hover:bg-slate-50"
        >
          <header className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <span
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-md shadow-blue-500/20 sm:h-12 sm:w-12 sm:text-base"
              >
                {getInitials(marketer.fullName)}
              </span>
              <div className="min-w-0 flex-1 flex-col overflow-hidden">
                <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">{marketer.fullName}</h2>
                <p className="truncate text-xs text-slate-600">منطقه: {marketer.region}</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${getStatusBadgeClass(marketer.isActive)}`}>
              {getStatusLabel(marketer.isActive)}
            </span>
          </header>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs text-slate-600">
            <div className="min-w-0 rounded-2xl border border-slate-300 bg-slate-50 px-2 py-2 sm:px-3 sm:py-3">
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">تعداد مشتری</p>
              <p className="mt-1 truncate text-base font-semibold text-slate-800 sm:text-lg">
                {numberFormatter.format(marketer.assignedCustomersCount)}
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-300 bg-slate-50 px-2 py-2 sm:px-3 sm:py-3">
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">امتیاز عملکرد</p>
              <p className="mt-1 truncate text-base font-semibold text-slate-800 sm:text-lg">
                {marketer.performanceScore ? numberFormatter.format(marketer.performanceScore) : "-"}
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-300 bg-slate-50 px-2 py-2 sm:px-3 sm:py-3">
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">آخرین ویزیت</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800 sm:text-sm">{formatDate(marketer.lastVisitAt)}</p>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-300 bg-slate-50 px-2 py-2 sm:px-3 sm:py-3">
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">نقش</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800 sm:text-sm">{marketer.role}</p>
            </div>
          </div>

          <footer className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => onEdit?.(marketer)}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              className="inline-flex shrink-0 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              ویرایش
            </button>
            <button className="shrink-0 truncate text-[10px] text-primary-600 transition hover:text-primary-700 sm:text-xs">ارسال پیام</button>
            <ProtectedComponent role="SUPER_ADMIN">
              <div className="shrink-0">
                <MarketerDeleteButton marketerId={marketer.id} marketerName={marketer.fullName} onDelete={onDelete} />
              </div>
            </ProtectedComponent>
          </footer>
        </article>
      ))}
    </>
  );
}
