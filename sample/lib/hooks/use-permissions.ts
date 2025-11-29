"use client";

import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { ROLE_PERMISSIONS } from "@/lib/permissions/role-permissions";
import type { RoleKey } from "@/lib/types";

/**
 * Hook برای بررسی دسترسی کاربر به permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.role) {
      return [];
    }

    return ROLE_PERMISSIONS[user.role as RoleKey] || [];
  }, [user?.role]);

  /**
   * بررسی دسترسی به یک permission خاص
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * بررسی دسترسی به یکی از permissions
   */
  const hasAnyPermission = (...permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.some((perm) => permissions.includes(perm));
  };

  /**
   * بررسی دسترسی به همه permissions
   */
  const hasAllPermissions = (...permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.every((perm) => permissions.includes(perm));
  };

  /**
   * بررسی نقش کاربر
   */
  const hasRole = (...roles: RoleKey[]): boolean => {
    if (!user?.role) {
      return false;
    }
    return roles.includes(user.role as RoleKey);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    role: user?.role as RoleKey | undefined,
  };
}

