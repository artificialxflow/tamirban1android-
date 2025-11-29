"use client";

import { useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createMarketerAction, type CreateMarketerFormState } from "@/app/dashboard/marketers/actions";

const createMarketerDefaultState: CreateMarketerFormState = {
  success: false,
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
      className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? "در حال ثبت..." : "ثبت بازاریاب"}
    </button>
  );
}

interface MarketerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MarketerCreateModal({ isOpen, onClose, onSuccess }: MarketerCreateModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createMarketerAction, createMarketerDefaultState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [state.success, onClose, onSuccess]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="بستن"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <header className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold text-slate-800">افزودن بازاریاب جدید</h2>
          <p className="mt-1 text-sm text-slate-500">اطلاعات بازاریاب را وارد کنید</p>
        </header>

        {state.message ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <form ref={formRef} className="grid grid-cols-1 gap-4 md:grid-cols-2" action={formAction}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            نام و نام خانوادگی
            <input
              name="fullName"
              required
              placeholder="مثال: سارا احمدی"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            شماره موبایل
            <input
              name="mobile"
              type="tel"
              required
              placeholder="09123456789"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            ایمیل (اختیاری)
            <input
              name="email"
              type="email"
              placeholder="example@domain.com"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            منطقه
            <input
              name="region"
              required
              placeholder="مثال: تهران"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
            نقش
            <select
              name="role"
              defaultValue="MARKETER"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="MARKETER">بازاریاب</option>
              <option value="FINANCE_MANAGER">مدیر مالی</option>
              <option value="SUPER_ADMIN">مدیر کل</option>
            </select>
          </label>

          <label className="md:col-span-2 flex items-center gap-3">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-slate-700">حساب کاربری فعال است</span>
          </label>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              انصراف
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

