"use client";

import { useEffect, useRef, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createCustomerAction, type CreateCustomerFormState } from "@/app/dashboard/customers/actions";
import { CUSTOMER_STATUSES } from "@/lib/types";
import { NeshanMap } from "@/components/visits/neshan-map";
import { Button } from "@/components/common/button";

const createCustomerDefaultState: CreateCustomerFormState = {
  success: false,
  message: null,
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  PENDING: "در انتظار پیگیری",
  AT_RISK: "احتمال ریزش",
  LOYAL: "مشتری وفادار",
  SUSPENDED: "متوقف شده",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      isLoading={pending}
      loadingText="در حال ثبت..."
      fullWidth
      className="sm:w-auto text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
    >
      ثبت مشتری
    </Button>
  );
}

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomerCreateModal({ isOpen, onClose, onSuccess }: CustomerCreateModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createCustomerAction, createCustomerDefaultState);
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState("");
  const locationMarkers = selectedLocation
    ? [
        {
          id: "customer-location",
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          title: locationAddress || "موقعیت مشتری",
        },
      ]
    : [];

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedLocation(null);
      setLocationAddress("");
      onSuccess?.();
      router.refresh(); // Refresh dashboard data
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [state.success, onClose, onSuccess, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-6 max-h-[90vh] overflow-y-auto">
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
          <h2 className="text-xl font-semibold text-slate-800">ثبت مشتری جدید</h2>
          <p className="mt-1 text-sm text-slate-500">اطلاعات مشتری را وارد کنید</p>
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
          <input type="hidden" name="geoLocation.latitude" value={selectedLocation?.latitude ?? ""} />
          <input type="hidden" name="geoLocation.longitude" value={selectedLocation?.longitude ?? ""} />
          <input type="hidden" name="geoLocation.addressLine" value={locationAddress} />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            نام مشتری <span className="text-rose-500">*</span>
            <input
              name="displayName"
              required
              placeholder="مثال: شرکت آرمان خودرو"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            شماره موبایل <span className="text-rose-500">*</span>
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

          <div className="md:col-span-2 flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-800">موقعیت جغرافیایی مشتری (اختیاری)</span>
              <span className="text-xs text-slate-500">روی نقشه کلیک کنید تا آدرس دقیق مشتری ثبت شود.</span>
            </div>
            <NeshanMap
              className="h-72"
              interactive
              center={selectedLocation ?? undefined}
              markers={locationMarkers}
              onLocationSelect={(coords) => setSelectedLocation(coords)}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">عرض جغرافیایی</label>
                <input
                  value={selectedLocation?.latitude?.toFixed(6) ?? ""}
                  readOnly
                  placeholder="---"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">طول جغرافیایی</label>
                <input
                  value={selectedLocation?.longitude?.toFixed(6) ?? ""}
                  readOnly
                  placeholder="---"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">توضیح یا آدرس کوتاه</label>
                <input
                  value={locationAddress}
                  onChange={(event) => setLocationAddress(event.target.value)}
                  placeholder="مثال: خیابان ولیعصر، کوچه ۱۲"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            {selectedLocation ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationAddress("");
                  }}
                  className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  حذف موقعیت انتخاب شده
                </button>
              </div>
            ) : null}
          </div>

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

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose} fullWidth className="sm:w-auto">
              انصراف
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

