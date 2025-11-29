"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";

const smsStats = [
  { label: "پیامک‌های ارسال شده", value: "0", helper: "هنوز پیامکی ارسال نشده است" },
  { label: "نرخ تحویل", value: "0%", helper: "داده‌ای موجود نیست" },
  { label: "هزینه ماه جاری", value: "0 ریال", helper: "هزینه‌ای ثبت نشده است" },
];

const smsCampaigns: Array<{ title: string; status: string; sent: string; date: string }> = [];

export default function SmsPage() {
  const [showMessage, setShowMessage] = useState(false);

  const handleCreateCampaign = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 4000);
  };

  return (
    <>
      {/* Toast Notification */}
      {showMessage && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700 shadow-lg">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>این قابلیت در حال توسعه است. به زودی در دسترس خواهد بود.</span>
            <button
              onClick={() => setShowMessage(false)}
              className="ml-2 rounded-full p-1 text-blue-600 transition hover:bg-blue-100"
              aria-label="بستن"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <AppShell
        title="مرکز پیامک‌ها"
        description="مرکز مدیریت کمپین‌های پیامکی، وضعیت ارسال و آمار تحویل."
        activeHref="/dashboard/sms"
        actions={
          <button
            onClick={handleCreateCampaign}
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
          >
            ایجاد کمپین جدید
          </button>
        }
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {smsStats.map((item) => (
          <article key={item.label} className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <p className="text-xs font-semibold text-slate-600">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{item.value}</p>
            <p className="mt-2 text-xs text-slate-600">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 border-b-2 border-slate-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-800">کمپین‌های اخیر</h2>
            <p className="text-xs text-slate-600">نمونه داده برای تایید ساختار UI مرکز پیامک</p>
          </div>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">مشاهده گزارش کامل</button>
        </header>
        {smsCampaigns.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {smsCampaigns.map((campaign) => (
              <li
                key={campaign.title}
                className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">{campaign.title}</span>
                  <span className="text-xs text-slate-600">{campaign.sent} · آخرین آپدیت {campaign.date}</span>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-white border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700">
                  {campaign.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
            <span>هنوز کمپین پیامکی ثبت نشده است.</span>
            <span>با ایجاد کمپین جدید، این بخش به‌صورت خودکار بروز خواهد شد.</span>
          </div>
        )}
      </section>
      </AppShell>
    </>
  );
}
