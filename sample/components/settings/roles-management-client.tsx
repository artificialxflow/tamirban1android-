"use client";

import { useEffect, useState } from "react";
import { RoleEditModal } from "./role-edit-modal";
import { RoleUsersModal } from "./role-users-modal";
import type { RoleInfo } from "@/lib/services/roles.service";

export function RolesManagementClient() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null);
  const [viewingUsers, setViewingUsers] = useState<RoleInfo | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("لطفاً ابتدا وارد شوید.");
        return;
      }

      const response = await fetch("/api/settings/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "خطا در دریافت نقش‌ها");
      }

      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        throw new Error(data.message || "خطا در دریافت نقش‌ها");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت نقش‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: RoleInfo) => {
    setEditingRole(role);
  };

  const handleViewUsers = (role: RoleInfo) => {
    setViewingUsers(role);
  };

  const handleRoleUpdated = () => {
    loadRoles();
    setEditingRole(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border-2 border-slate-300 bg-white p-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-600">در حال بارگذاری نقش‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-800">خطا</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={loadRoles}
            className="ml-auto rounded-full border-2 border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition hover:border-red-400 hover:bg-red-200"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="rounded-3xl border-2 border-slate-300 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b-2 border-slate-300 bg-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">مدیریت نقش‌ها</h2>
            <p className="text-xs text-slate-600">تعریف نقش‌ها و کاربرانی که به آنها تخصیص یافته‌اند</p>
          </div>
        </header>

        <div className="divide-y divide-slate-200">
          {roles.map((role) => (
            <div key={role.key} className="flex flex-col gap-3 px-6 py-5 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-800">{role.label}</h3>
                  <span className="rounded-full bg-primary-100 border-2 border-primary-300 px-3 py-1 text-xs font-semibold text-primary-700">
                    {role.userCount} کاربر
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewUsers(role)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                  >
                    مشاهده کاربران
                  </button>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                  >
                    ویرایش دسترسی‌ها
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs text-slate-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingRole && (
        <RoleEditModal
          role={editingRole}
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={handleRoleUpdated}
        />
      )}

      {viewingUsers && (
        <RoleUsersModal
          role={viewingUsers}
          isOpen={!!viewingUsers}
          onClose={() => setViewingUsers(null)}
        />
      )}
    </>
  );
}

