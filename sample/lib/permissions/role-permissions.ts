import type { RoleKey } from "@/lib/types";

/**
 * تعریف permissions برای هر نقش
 * این فایل فقط تعریف permissions را دارد و به MongoDB وابسته نیست
 * بنابراین می‌تواند در Client Components استفاده شود
 */
export const ROLE_PERMISSIONS: Record<RoleKey, string[]> = {
  SUPER_ADMIN: [
    "users:read",
    "users:write",
    "users:delete",
    "customers:read",
    "customers:write",
    "customers:delete",
    "visits:read",
    "visits:write",
    "visits:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "marketers:read",
    "marketers:write",
    "marketers:delete",
    "reports:read",
    "settings:read",
    "settings:write",
  ],
  FINANCE_MANAGER: [
    "customers:read",
    "invoices:read",
    "invoices:write",
    "reports:read",
  ],
  MARKETER: [
    "customers:read",
    "customers:write",
    "visits:read",
    "visits:write",
    "invoices:read",
    "invoices:write",
  ],
  CUSTOMER: [
    "customers:read",
    "invoices:read",
  ],
};

