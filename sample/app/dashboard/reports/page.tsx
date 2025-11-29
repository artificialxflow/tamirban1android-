import { AppShell } from "@/components/layout/app-shell";

const kpis = [
  { title: "درآمد ماه جاری", value: "0 ریال", delta: "داده‌ای موجود نیست" },
  { title: "نرخ تبدیل پیش‌فاکتور", value: "0%", delta: "داده‌ای موجود نیست" },
  { title: "میانگین زمان پیگیری", value: "0 روز", delta: "داده‌ای موجود نیست" },
];

const timeline: Array<{ label: string; value: string; status: string }> = [];

export default function ReportsPage() {
  return (
    <AppShell
      title="گزارش‌ها و تحلیل"
      description="پیش‌نمایش ساختار گزارش‌های مدیریتی برای تایید UI قبل از اتصال داده واقعی."
      activeHref="/dashboard/reports"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
            خروجی Excel
          </button>
          <button
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
          >
            تولید PDF
          </button>
        </div>
      }
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <article key={item.title} className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <h2 className="text-sm font-semibold text-slate-600">{item.title}</h2>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{item.value}</p>
            <span className="mt-2 inline-flex w-fit rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
              {item.delta}
            </span>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 border-b-2 border-slate-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-800">روند ماهانه</h2>
            <p className="text-xs text-slate-600">ثابت نگهدارنده برای نمایش دیتای روندی در نسخه نهایی</p>
          </div>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">مشاهده جزئیات</button>
        </header>
        {timeline.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {timeline.map((item) => (
              <article key={item.label} className="flex flex-col gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <span className="text-base font-semibold text-slate-800">{item.value}</span>
                <span className="text-xs text-primary-700 font-medium">{item.status}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
            <span>هنوز داده‌ای برای نمایش روند ماهانه ثبت نشده است.</span>
            <span>با ثبت مشتریان، ویزیت‌ها و پیش‌فاکتورها، این بخش به‌صورت خودکار بروز خواهد شد.</span>
          </div>
        )}
      </section>

      <section className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-800">TODO اتصال به Data Warehouse</h2>
          <span className="text-xs text-slate-600">این بخش بر اساس تصمیم فاز ۶ به داده واقعی متصل خواهد شد.</span>
        </header>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          این صفحه در حال حاضر صرفاً برای تایید چیدمان و نمایش شاخص‌های کلیدی طراحی شده است. پس از اتصال به سرویس آمار،
          نمودارها و جداول تعاملی جایگزین کارت‌های نمونه خواهند شد.
        </p>
      </section>
    </AppShell>
  );
}
