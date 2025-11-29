'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { createCustomerAction, type CreateCustomerFormState } from '@/app/dashboard/customers/actions';
import { CUSTOMER_STATUSES } from '@/lib/types';

const createCustomerDefaultState: CreateCustomerFormState = {
  success: false,
  message: null,
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'فعال',
  INACTIVE: 'غیرفعال',
  PENDING: 'در انتظار پیگیری',
  AT_RISK: 'احتمال ریزش',
  LOYAL: 'مشتری وفادار',
  SUSPENDED: 'متوقف شده',
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
      {pending ? 'در حال ثبت...' : 'ثبت مشتری'}
    </button>
  );
}

export function CustomerCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createCustomerAction, createCustomerDefaultState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6">
      <header className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-800">ثبت سریع مشتری جدید</h2>
        <p className="text-xs text-slate-500">
          برای تست اتصال، فرم زیر را تکمیل کنید. با موفقیت ثبت شدن، لیست مشتریان به‌روزرسانی می‌شود.
        </p>
      </header>

      {state.message ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
            state.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <form ref={formRef} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" action={formAction}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          نام مشتری
          <input
            name="displayName"
            required
            placeholder="مثال: شرکت آرمان خودرو"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          شماره موبایل
          <input
            name="phone"
            type="tel"
            required
            placeholder="09123456789"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          شهر
          <input
            name="city"
            placeholder="تهران"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          وضعیت
          <select
            name="status"
            defaultValue="ACTIVE"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            {CUSTOMER_STATUSES.map((status) => {
              const label = STATUS_LABELS[status] ?? status;
              return (
                <option key={status} value={status}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
          برچسب‌ها (با کاما جدا کنید)
          <input
            name="tags"
            placeholder="VIP, قطعات, فوری"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
          یادداشت
          <textarea
            name="notes"
            rows={3}
            placeholder="توضیحات یا نیازهای ویژه مشتری"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-end">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}


