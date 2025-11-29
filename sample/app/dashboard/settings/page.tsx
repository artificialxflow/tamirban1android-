import { AppShell } from "@/components/layout/app-shell";

const tabs = [
  { id: "access", label: "دسترسی‌ها" },
  { id: "notifications", label: "اعلان‌ها" },
  { id: "integrations", label: "یکپارچگی‌ها" },
  { id: "appearance", label: "ظاهر سیستم" },
  { id: "security", label: "امنیت" },
];

const roles = [
  {
    name: "مدیر کل",
    permissions: "مدیریت کامل سیستم، دسترسی به گزارش‌های مالی و تنظیمات امنیتی",
    members: ["رضا توکلی", "سمیرا بهمنی"],
  },
  {
    name: "مدیر مالی",
    permissions: "مشاهده و تایید پیش‌فاکتور، مدیریت پرداخت‌ها، گزارش مالی ماهانه",
    members: ["الهام رضوی"],
  },
  {
    name: "بازاریاب",
    permissions: "مدیریت مشتریان تخصیص‌یافته، ثبت ویزیت، ارسال پیش‌فاکتور آزمایشی",
    members: ["سارا احمدی", "امیرحسین صابری", "نیلوفر کرمی"],
  },
  {
    name: "پشتیبانی",
    permissions: "پیگیری درخواست‌های پس از فروش و مدیریت پیامک‌ها",
    members: ["تیم پشتیبانی CRM"],
  },
];

const notificationChannels = [
  {
    title: "پیامک OTP",
    description: "ارسال کد تایید ورود برای کاربران و مشتریان",
    enabled: true,
  },
  {
    title: "گزارش‌های روزانه ایمیل",
    description: "ارسال خلاصه عملکرد بازاریاب‌ها به مدیر کل",
    enabled: false,
  },
  {
    title: "هشدار فاکتور معوق",
    description: "ارسال اعلان به مدیر مالی در صورت عبور از سررسید",
    enabled: true,
  },
];

const integrationCards = [
  {
    name: "سامانه پیامکی کاوه نگار",
    status: "فعال",
    description: "ارسال OTP و پیامک‌های اطلاع‌رسانی",
    actions: ["تنظیم مجدد کلید", "مشاهده گزارش ارسال"],
  },
  {
    name: "نقشه نشان",
    status: "در حال اتصال",
    description: "نمایش موقعیت تعمیرگاه‌ها و برنامه ویزیت",
    actions: ["تایید API Key", "راهنمای اتصال"],
  },
  {
    name: "درگاه پرداخت زرین‌پال",
    status: "پیشنهاد شده",
    description: "امکان پرداخت آنلاین پیش‌فاکتور توسط مشتری",
    actions: ["شروع فرآیند اتصال"],
  },
];

export default function SettingsPreviewPage() {
  return (
    <AppShell
      title="تنظیمات سیستم"
      description="مدیریت نقش‌ها، اعلان‌ها و یکپارچگی‌ها قبل از اتصال به داده‌های واقعی."
      activeHref="/dashboard/settings"
      actions={
        <>
          <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
            ذخیره تغییرات
          </button>
          <button
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
          >
            بازگشت به تنظیمات پیش‌فرض
          </button>
        </>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          حالت پیش‌نمایش: تغییرات ذخیره نمی‌شوند • تمام موارد بر اساس داده ثابت هستند.
        </div>
      }
      footerNote={<span>آخرین بروزرسانی UI: فاز ۳ — ماژول تنظیمات آزمایشی</span>}
    >
      <section className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                style={index === 0 ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' } : undefined}
                className={[
                  "rounded-full px-4 py-2 transition",
                  index === 0
                    ? "text-white shadow-md shadow-blue-500/20"
                    : "border-2 border-primary-300 bg-primary-100 text-primary-800 hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md font-semibold",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
            مشاهده تاریخچه تغییرات
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr,1fr]">
          <section className="rounded-3xl border-2 border-slate-300 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b-2 border-slate-300 bg-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">مدیریت نقش‌ها</h2>
                <p className="text-xs text-slate-600">تعریف نقش‌ها و کاربرانی که به آنها تخصیص یافته‌اند</p>
              </div>
              <a
                href="/dashboard/settings/roles"
                className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
              >
                مدیریت نقش‌ها
              </a>
            </header>
            <ul className="flex flex-col divide-y divide-slate-200">
              {roles.map((role) => (
                <li key={role.name} className="flex flex-col gap-3 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">{role.name}</h3>
                    <a
                      href="/dashboard/settings/roles"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      ویرایش دسترسی‌ها
                    </a>
                  </div>
                  <p className="text-xs text-slate-600">{role.permissions}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {role.members.map((member) => (
                      <span key={member} className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-slate-700">
                        {member}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">کانال‌های اعلان</h2>
                <p className="text-xs text-slate-600">بر اساس تصمیم فاز ۵، فعال‌سازی کانال‌ها با داده واقعی انجام می‌شود</p>
              </div>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700">تنظیمات پیشرفته</button>
            </header>
            <ul className="flex flex-col gap-3 text-sm text-slate-700">
              {notificationChannels.map((channel) => (
                <li
                  key={channel.title}
                  className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800">{channel.title}</span>
                    <span className="text-xs text-slate-600">{channel.description}</span>
                  </div>
                  <button
                    className={[
                      "rounded-full px-4 py-2 text-xs font-medium transition",
                      channel.enabled
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300",
                    ].join(" ")}
                  >
                    {channel.enabled ? "فعال" : "غیرفعال"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border-2 border-slate-300 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b-2 border-slate-300 bg-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">یکپارچگی‌ها</h2>
              <p className="text-xs text-slate-600">لیست سرویس‌های متصل یا در انتظار اتصال برای فازهای بعدی</p>
            </div>
            <button className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
              افزودن یکپارچگی جدید
            </button>
          </header>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            {integrationCards.map((integration) => (
              <article
                key={integration.name}
                className="flex flex-col gap-3 rounded-3xl border-2 border-slate-300 bg-white p-5 shadow-sm"
              >
                <header className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">{integration.name}</h3>
                  <span className="rounded-full bg-primary-100 border-2 border-primary-300 px-3 py-1 text-xs font-semibold text-primary-700">
                    {integration.status}
                  </span>
                </header>
                <p className="text-xs text-slate-600">{integration.description}</p>
                <footer className="flex flex-wrap gap-2 text-xs">
                  {integration.actions.map((action) => (
                    <button
                      key={action}
                      className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
                    >
                      {action}
                    </button>
                  ))}
                </footer>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">حوزه‌های امنیتی</h2>
            <p className="text-xs text-slate-600">
              یادآوری مواردی که باید هنگام پیاده‌سازی واقعی احراز هویت، رمزنگاری و لاگ‌ها در نظر گرفته شود
            </p>
          </div>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">بازبینی سیاست‌ها</button>
        </header>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-5 text-xs text-slate-700">
            <h3 className="text-sm font-semibold text-slate-800">احراز هویت</h3>
            <p>OTP رمزنگاری‌شده با bcrypt، صدور JWT و امکان قفل حساب پس از تلاش ناموفق متوالی.</p>
            <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">نمایش سیاست پیشنهادی</button>
          </article>
          <article className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-5 text-xs text-slate-700">
            <h3 className="text-sm font-semibold text-slate-800">ذخیره‌سازی داده</h3>
            <p>عدم ذخیره OTP خام، نگهداری لاگ رویدادها و پاکسازی برنامه‌ریزی‌شده اطلاعات حساس.</p>
            <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">چک‌لیست دیتابیس</button>
          </article>
          <article className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-5 text-xs text-slate-700">
            <h3 className="text-sm font-semibold text-slate-800">انطباق و مانیتورینگ</h3>
            <p>تعریف هشدار برای تلاش‌های مشکوک، ثبت لاگ و هشدار ایمیلی برای مدیر امنیت.</p>
            <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">لیست اقدامات</button>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

