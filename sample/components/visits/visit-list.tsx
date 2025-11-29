"use client";

import type { VisitSummary } from "@/lib/services/visits.service";
import type { VisitStatus } from "@/lib/types";
import { ProtectedComponent } from "@/components/common/protected-component";
import { Button } from "@/components/common/button";

const STATUS_LABELS: Record<VisitStatus, string> = {
  SCHEDULED: "زمان‌بندی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد",
};

const STATUS_BADGE_CLASS: Record<VisitStatus, string> = {
  SCHEDULED: "bg-primary-100 text-primary-700 border border-primary-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border border-rose-200",
};

const timeFormatter = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDateTime(value: Date) {
  return `${dateFormatter.format(value)} ${timeFormatter.format(value)}`;
}

interface VisitListProps {
  visits: VisitSummary[];
  onVisitClick?: (visitId: string) => void;
  onEdit?: (visit: VisitSummary) => void;
  onDelete?: (visitId: string) => void;
  deletingVisitId?: string | null;
  variant?: "table" | "cards";
}

export function VisitList({ visits, onVisitClick, onEdit, onDelete, deletingVisitId, variant = "table" }: VisitListProps) {
  if (variant === "cards") {
    return (
      <div className="space-y-3">
        {visits.map((visit) => (
          <article
            key={`${visit.id}-card`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            onClick={() => onVisitClick?.(visit.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{visit.customerName}</p>
                <p className="mt-1 text-[12px] text-slate-500">{formatDateTime(visit.scheduledAt)}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${STATUS_BADGE_CLASS[visit.status]}`}>
                {STATUS_LABELS[visit.status]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-slate-500">
              <span>بازاریاب: {visit.marketerName ?? "نامشخص"}</span>
              <span>موضوع: {visit.topics.length > 0 ? visit.topics.join(", ") : "-"}</span>
              <span className="col-span-2 text-slate-500">یادداشت: {visit.notes || "-"}</span>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onVisitClick?.(visit.id);
                }}
                className="text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
              >
                جزئیات
              </Button>
              <ProtectedComponent permission="visits:write">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(visit);
                  }}
                  className="text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
                >
                  ویرایش
                </Button>
              </ProtectedComponent>
              <ProtectedComponent permission="visits:delete">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("آیا مطمئن هستید که می‌خواهید این ویزیت را حذف کنید؟")) {
                      onDelete?.(visit.id);
                    }
                  }}
                  disabled={deletingVisitId === visit.id}
                  isLoading={deletingVisitId === visit.id}
                  loadingText="حذف..."
                >
                  حذف
                </Button>
              </ProtectedComponent>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <tbody className="divide-y divide-slate-100 bg-white">
      {visits.map((visit) => (
        <tr key={visit.id} className="transition hover:bg-slate-50">
          <td className="px-4 py-3 text-[13px] text-slate-500">{formatDateTime(visit.scheduledAt)}</td>
          <td className="px-4 py-3 text-sm font-semibold text-slate-800">{visit.customerName}</td>
          <td className="px-4 py-3 text-sm text-slate-600">{visit.marketerName ?? "نامشخص"}</td>
          <td className="px-4 py-3 text-[12px] text-slate-500">
            {visit.topics.length > 0 ? visit.topics.join(", ") : "-"}
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[visit.status]}`}>
              {STATUS_LABELS[visit.status]}
            </span>
          </td>
          <td className="px-4 py-3 max-w-xs truncate text-[12px] text-slate-500">{visit.notes || "-"}</td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() => onVisitClick?.(visit.id)}
                className="text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
              >
                جزئیات
              </Button>
              <ProtectedComponent permission="visits:write">
                <Button
                  size="sm"
                  onClick={() => onEdit?.(visit)}
                  className="text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
                >
                  ویرایش
                </Button>
              </ProtectedComponent>
              <ProtectedComponent permission="visits:delete">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm("آیا مطمئن هستید که می‌خواهید این ویزیت را حذف کنید؟")) {
                      onDelete?.(visit.id);
                    }
                  }}
                  disabled={deletingVisitId === visit.id}
                  isLoading={deletingVisitId === visit.id}
                  loadingText="حذف..."
                >
                  حذف
                </Button>
              </ProtectedComponent>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

