'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/hooks/use-auth";
import { usePermissions } from "@/lib/hooks/use-permissions";
import type { RoleKey } from "@/lib/types";

type NavItem = {
  name: string;
  href: string;
  badge?: string;
  /**
   * نقش‌های مجاز برای مشاهده این منو
   */
  allowedRoles?: RoleKey[];
  /**
   * Permission مورد نیاز برای مشاهده این منو
   */
  requiredPermission?: string;
};

const ALL_NAV_ITEMS: NavItem[] = [
  { name: "داشبورد", href: "/dashboard" },
  { name: "مشتریان", href: "/dashboard/customers" },
  { name: "بازاریاب‌ها", href: "/dashboard/marketers", requiredPermission: "marketers:read" },
  { name: "ویزیت‌ها", href: "/dashboard/visits", requiredPermission: "visits:read" },
  { name: "پیش‌فاکتورها", href: "/dashboard/invoices", requiredPermission: "invoices:read" },
  { name: "پیامک‌ها", href: "/dashboard/sms" },
  { name: "گزارش‌ها", href: "/dashboard/reports", requiredPermission: "reports:read" },
  { name: "تنظیمات", href: "/dashboard/settings", allowedRoles: ["SUPER_ADMIN"] },
];

type AppShellProps = {
  title: string;
  children: ReactNode;
  description?: string;
  activeHref?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  footerNote?: ReactNode;
};

export function AppShell({
  title,
  description,
  children,
  activeHref = "/dashboard",
  actions,
  toolbar,
  footerNote,
}: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // فیلتر کردن منوها بر اساس نقش و دسترسی
  const filteredNavItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      // اگر allowedRoles تعریف شده، بررسی نقش
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        if (!user?.role || !hasRole(...item.allowedRoles)) {
          return false;
        }
      }

      // اگر requiredPermission تعریف شده، بررسی permission
      if (item.requiredPermission) {
        if (!hasPermission(item.requiredPermission)) {
          return false;
        }
      }

      return true;
    });
  }, [user?.role, hasPermission, hasRole]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const resolvedFooter = useMemo(
    () => footerNote ?? <span>آخرین بروزرسانی UI: فاز ۳ — نمونه اولیه داشبورد</span>,
    [footerNote],
  );

  const sidebar = (
    <aside className="flex w-full flex-col gap-6 rounded-3xl border-2 border-slate-300 bg-linear-to-br from-white to-slate-50 p-6 shadow-lg lg:w-64">
      <header className="flex items-center justify-between rounded-2xl border-2 border-primary-200 bg-primary-50 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">TamirBan CRM</span>
          <span className="text-xl font-bold text-slate-800">تعمیربان</span>
        </div>
        <span
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          className="inline-flex items-center justify-center rounded-full border-2 border-primary-400 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/30"
        >
          v0.1
        </span>
      </header>

      <nav className="flex flex-col gap-1">
        {filteredNavItems.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={isActive ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' } : undefined}
              className={[
                "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "border-primary-400 text-white shadow-md shadow-blue-500/20" 
                  : "border-transparent text-slate-800 hover:border-primary-200 hover:bg-primary-50 focus:bg-primary-50",
              ].join(" ")}
            >
              <span>{item.name}</span>
              {item.badge ? (
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive ? "bg-white/20 text-white" : "bg-primary-200 text-primary-800 font-bold",
                  ].join(" ")}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-linear-to-br from-white to-slate-50 p-5 shadow-md">
        {user ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 shadow-inner">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-xs font-semibold text-slate-500">کاربر فعلی</p>
                <p className="truncate text-sm font-semibold text-slate-800">{user.mobile}</p>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-600">
                  نقش
                  <span className="text-primary-600">{user.role}</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 bg-linear-to-r from-red-100 to-red-200 px-5 py-3 text-sm font-bold text-red-900 transition hover:from-red-200 hover:to-red-300 hover:border-red-600 hover:text-red-950 shadow-md hover:shadow-lg"
              style={{ color: '#991b1b' }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              خروج از حساب
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-800">در حالت پیش‌نمایش</p>
            <p className="text-xs leading-6 text-slate-600">
              این نسخه تنها برای تایید ساختار UI آماده شده و هنوز به داده‌های واقعی متصل نیست.
            </p>
            <button className="rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-600 shadow-sm">
              دیدن سناریو نمونه
            </button>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:flex-row">
        <div className="flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
            aria-expanded={isMenuOpen}
            aria-controls="tamirban-sidebar"
            aria-label={isMenuOpen ? "بستن منو" : "باز کردن منو"}
          >
            {isMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div className="hidden w-full max-w-[260px] lg:flex lg:shrink-0" id="tamirban-sidebar">
          {sidebar}
        </div>

        <main className="flex w-full flex-1 flex-col gap-6 rounded-3xl bg-white backdrop-blur-sm p-6 shadow-md md:p-8 border-2 border-slate-300">
          <header className="flex flex-col gap-4 border-b-2 border-slate-300 pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold leading-tight md:text-3xl text-slate-800">{title}</h1>
                {description ? <p className="text-sm text-slate-600">{description}</p> : null}
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-3">{actions}</div>
              ) : null}
            </div>
            {toolbar ? <div className="flex flex-col gap-3">{toolbar}</div> : null}
          </header>

          <div className="flex flex-col gap-6">{children}</div>

          <footer className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} TamirBan CRM, تمامی حقوق محفوظ است.</span>
            {resolvedFooter}
          </footer>
        </main>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-start lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-label="بستن منو"
          />
          <div className="relative z-10 ml-auto m-4 w-full max-w-xs" id="tamirban-sidebar">
            {sidebar}
          </div>
        </div>
      ) : null}
    </div>
  );
}

