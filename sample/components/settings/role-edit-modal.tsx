"use client";

import { useEffect, useState } from "react";
import type { RoleInfo } from "@/lib/services/roles.service";

interface RoleEditModalProps {
  role: RoleInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RoleEditModal({ role, isOpen, onClose, onSuccess }: RoleEditModalProps) {
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllPermissions();
      setSelectedPermissions(role.permissions);
    }
  }, [isOpen, role]);

  const loadAllPermissions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("لطفاً ابتدا وارد شوید.");
        return;
      }

      const response = await fetch("/api/settings/roles/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت permissions");
      }

      const data = await response.json();
      if (data.success) {
        setAllPermissions(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت permissions");
    }
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // توجه: در حال حاضر نقش‌ها static هستند و نمی‌توان permissions را ویرایش کرد
      // این یک پیاده‌سازی نمونه است که می‌تواند در آینده تکمیل شود
      // برای ویرایش واقعی، باید یک سیستم dynamic برای نقش‌ها پیاده‌سازی شود

      // نمایش پیام موفقیت
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تغییرات");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl border-2 border-slate-300 bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 bg-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">ویرایش دسترسی‌های نقش</h2>
            <p className="text-xs text-slate-600">{role.label}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <strong>توجه:</strong> در حال حاضر نقش‌ها به صورت static تعریف شده‌اند و نمی‌توان permissions
            آنها را ویرایش کرد. این قابلیت در نسخه‌های بعدی اضافه خواهد شد.
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">دسترسی‌های موجود:</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {allPermissions.map((permission) => {
                const isSelected = selectedPermissions.includes(permission);
                return (
                  <label
                    key={permission}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition ${
                      isSelected
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePermission(permission)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      disabled
                    />
                    <span className="text-sm text-slate-700">{permission}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-300 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}

