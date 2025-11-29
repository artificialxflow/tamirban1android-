const highlights = [
  {
    title: "احراز هویت ایمن",
    description:
      "ورود با OTP رمزنگاری‌شده، مدیریت نشست با JWT و کنترل تعداد تلاش‌ها برای امنیت بیشتر.",
  },
  {
    title: "مدیریت شبکه و مشتریان",
    description:
      "ثبت مشتری، ویزیت، پیش‌فاکتور و پیگیری بازاریاب‌ها در یک داشبورد واحد و ساده.",
  },
  {
    title: "گزارش‌های تعاملی",
    description:
      "تجمیع KPIها، خروجی Excel و PDF برای نظارت دقیق بر عملکرد تیم و شعب تعمیرگاهی.",
  },
];

const summaryBadges = [
  "احراز هویت OTP متصل به تابان‌اس‌ام‌اس",
  "مدیریت یکپارچه مشتری، ویزیت، پیش‌فاکتور",
  "ثبت مختصات و گزارش‌گیری مخصوص تیم بازاریابی",
];

import Link from "next/link";

export default function Home() {
  return (
    <main className="container flex flex-1 flex-col gap-16 py-16">
      <section className="flex flex-col gap-8 rounded-2xl bg-white p-10 shadow-soft">
        <span className="inline-flex max-w-fit items-center gap-3 rounded-full bg-primary-100 border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700">
          تعمیربان | TamirBan CRM
        </span>
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold leading-[1.3] text-slate-800 md:text-5xl">
            کنترل کامل شبکه تعمیرگاه‌ها با یک پلتفرم یکپارچه و فارسی
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
            این مخزن نقطه شروع برای توسعه نسخه وب و PWA تعمیربان است. در اینجا
            فونداسیون UI/UX، ساختار پوشه‌ها و پیش‌نیازهای Tailwind/TypeScript
            فراهم شده تا بتوان فازهای بعدی را سریع‌تر اجرا کرد.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {summaryBadges.map((badge) => (
            <span key={badge} className="rounded-full border border-slate-200 px-4 py-2">
              {badge}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            className="group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>مشاهده پیش‌نمایش داشبورد</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 active:scale-95"
          >
            <span>مشاهده ماک احراز هویت OTP</span>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-800">{item.title}</h2>
            <p className="text-sm leading-7 text-slate-600">
              {item.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
