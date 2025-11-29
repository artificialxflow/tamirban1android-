"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/lib/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * کامپوننت محافظ برای صفحات که نیاز به احراز هویت دارند
 */
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // اگر صفحه نیاز به احراز هویت دارد و کاربر وارد نشده است
    if (requireAuth && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }

    // اگر کاربر وارد شده است و در صفحه auth است، به داشبورد هدایت شود
    if (isAuthenticated && pathname === "/auth") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, router]);

  // نمایش loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // اگر نیاز به احراز هویت دارد و کاربر وارد نشده است، چیزی نمایش نده
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

