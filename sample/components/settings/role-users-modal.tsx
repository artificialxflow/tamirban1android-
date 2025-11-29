"use client";

import { useEffect, useState } from "react";
import type { RoleInfo } from "@/lib/services/roles.service";
import type { User } from "@/lib/types";

interface RoleUsersModalProps {
  role: RoleInfo;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleUsersModal({ role, isOpen, onClose }: RoleUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, role.key]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("لطفاً ابتدا وارد شوید.");
        return;
      }

      const response = await fetch(`/api/settings/roles/${role.key}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "خطا در دریافت کاربران");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || "خطا در دریافت کاربران");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border-2 border-slate-300 bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 bg-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">کاربران نقش {role.label}</h2>
            <p className="text-xs text-slate-600">تعداد کل: {users.length} کاربر</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                <p className="text-sm text-slate-600">در حال بارگذاری...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-600">هیچ کاربری با این نقش یافت نشد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-2xl border-2 border-slate-300 bg-white p-4 hover:border-slate-400 transition"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
                    <span className="text-xs text-slate-600">{user.mobile}</span>
                    {user.email && <span className="text-xs text-slate-500">{user.email}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {user.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-300 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

