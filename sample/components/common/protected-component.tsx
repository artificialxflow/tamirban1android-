"use client";

import { usePermissions } from "@/lib/hooks/use-permissions";
import type { RoleKey } from "@/lib/types";

interface ProtectedComponentProps {
  children: React.ReactNode;
  /**
   * Permission مورد نیاز برای نمایش
   */
  permission?: string;
  /**
   * یکی از permissions مورد نیاز (OR)
   */
  anyPermission?: string[];
  /**
   * همه permissions مورد نیاز (AND)
   */
  allPermissions?: string[];
  /**
   * نقش مورد نیاز
   */
  role?: RoleKey | RoleKey[];
  /**
   * کامپوننت جایگزین در صورت عدم دسترسی
   */
  fallback?: React.ReactNode;
  /**
   * نمایش پیام "دسترسی ندارید" در صورت عدم دسترسی
   */
  showMessage?: boolean;
}

/**
 * کامپوننت محافظ برای نمایش شرطی بر اساس دسترسی
 */
export function ProtectedComponent({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  fallback,
  showMessage = false,
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  // بررسی permission
  if (permission && !hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showMessage) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          شما دسترسی لازم برای این بخش را ندارید.
        </div>
      );
    }
    return null;
  }

  // بررسی anyPermission (OR)
  if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(...anyPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showMessage) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          شما دسترسی لازم برای این بخش را ندارید.
        </div>
      );
    }
    return null;
  }

  // بررسی allPermissions (AND)
  if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(...allPermissions)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showMessage) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          شما دسترسی لازم برای این بخش را ندارید.
        </div>
      );
    }
    return null;
  }

  // بررسی role
  if (role) {
    const rolesToCheck = Array.isArray(role) ? role : [role];
    if (!hasRole(...rolesToCheck)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      if (showMessage) {
        return (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            شما دسترسی لازم برای این بخش را ندارید.
          </div>
        );
      }
      return null;
    }
  }

  return <>{children}</>;
}

