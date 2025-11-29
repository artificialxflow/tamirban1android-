"use client";

import { useEffect, useRef, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateVisitAction, type UpdateVisitFormState } from "@/app/dashboard/visits/actions";
import { apiClient } from "@/lib/utils/api-client";
import type { CustomerSummary } from "@/lib/services/customers.service";
import type { MarketerSummary } from "@/lib/services/marketers.service";
import type { VisitDetail } from "@/lib/services/visits.service";
import { SearchableSelect } from "./searchable-select";
import { PersianDateTimePicker } from "./persian-date-time-picker";
import { ProtectedComponent } from "@/components/common/protected-component";
import { NeshanMap } from "./neshan-map";
import type { MapMarker } from "./neshan-map";
import { Button } from "@/components/common/button";

const updateVisitDefaultState: UpdateVisitFormState = {
  success: false,
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" isLoading={pending} loadingText="در حال به‌روزرسانی...">
      ذخیره تغییرات
    </Button>
  );
}

interface VisitEditModalProps {
  visit: VisitDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VisitEditModal({ visit, isOpen, onClose, onSuccess }: VisitEditModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(updateVisitAction, updateVisitDefaultState);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [marketers, setMarketers] = useState<MarketerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(visit.customerId);
  const [selectedMarketerId, setSelectedMarketerId] = useState<string>(visit.marketerId);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(
    visit.locationSnapshot ? { latitude: visit.locationSnapshot.latitude, longitude: visit.locationSnapshot.longitude } : null,
  );
  const [locationAddress, setLocationAddress] = useState(visit.locationSnapshot?.address ?? "");

  // ایجاد markers برای نمایش موقعیت موجود
  const selectedMarkers: MapMarker[] = selectedLocation
    ? [
        {
          id: visit.id,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          title: visit.locationSnapshot?.address || "موقعیت ویزیت",
        },
      ]
    : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedCustomerId(visit.customerId);
      setSelectedMarketerId(visit.marketerId);
      setSelectedLocation(
        visit.locationSnapshot
          ? { latitude: visit.locationSnapshot.latitude, longitude: visit.locationSnapshot.longitude }
          : null,
      );
      setLocationAddress(visit.locationSnapshot?.address ?? "");
      setLoading(true);
      
      // Fetch customers and marketers for dropdowns
      Promise.all([
        apiClient.get<{ data: CustomerSummary[]; total: number; page: number; limit: number }>("/customers?limit=100"),
        apiClient.get<{ data: MarketerSummary[]; total: number; page: number; limit: number }>("/marketers?limit=100"),
      ])
        .then(([customersRes, marketersRes]) => {
          if (customersRes.success && 'data' in customersRes && customersRes.data) {
            const responseData = customersRes.data as { data?: CustomerSummary[]; total?: number; page?: number; limit?: number };
            let customersData: CustomerSummary[] = [];
            
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              if (Array.isArray(responseData.data)) {
                customersData = responseData.data;
              }
            } else if (Array.isArray(responseData)) {
              customersData = responseData;
            }
            
            setCustomers(customersData);
          } else {
            setCustomers([]);
          }
          
          if (marketersRes.success && 'data' in marketersRes && marketersRes.data) {
            const responseData = marketersRes.data as { data?: MarketerSummary[]; total?: number; page?: number; limit?: number };
            let marketersData: MarketerSummary[] = [];
            
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              if (Array.isArray(responseData.data)) {
                marketersData = responseData.data;
              }
            } else if (Array.isArray(responseData)) {
              marketersData = responseData;
            }
            
            setMarketers(marketersData);
          } else {
            setMarketers([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setCustomers([]);
          setMarketers([]);
          setLoading(false);
        });
    }
  }, [isOpen, visit]);

  useEffect(() => {
    if (!state.success || !isOpen) {
      return undefined;
    }

    onSuccess?.();
    const timer = setTimeout(() => {
      formRef.current?.reset();
      setSelectedLocation(
        visit.locationSnapshot
          ? { latitude: visit.locationSnapshot.latitude, longitude: visit.locationSnapshot.longitude }
          : null,
      );
      setLocationAddress(visit.locationSnapshot?.address ?? "");
      onClose();
    }, 500);

    return () => clearTimeout(timer);
  }, [state.success, isOpen, onClose, onSuccess, visit.locationSnapshot]);

  if (!isOpen) {
    return null;
  }

  // Format scheduledAt for input
  const scheduledAtDate = visit.scheduledAt instanceof Date 
    ? visit.scheduledAt 
    : new Date(visit.scheduledAt as string);
  const scheduledAtString = scheduledAtDate.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
          <h2 className="text-xl font-semibold text-slate-800">ویرایش ویزیت</h2>
          <p className="mt-1 text-sm text-slate-500">اطلاعات ویزیت را ویرایش کنید</p>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
          </div>
        ) : (
          <form ref={formRef} className="grid grid-cols-1 gap-4 md:grid-cols-2" action={formAction}>
            <input type="hidden" name="visitId" value={visit.id} />
            <input type="hidden" name="locationLatitude" value={selectedLocation?.latitude ?? ""} />
            <input type="hidden" name="locationLongitude" value={selectedLocation?.longitude ?? ""} />
            
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              مشتری <span className="text-rose-500">*</span>
              <SearchableSelect
                name="customerId"
                required
                options={customers.map((customer) => ({
                  id: customer.id,
                  label: `${customer.name} (${customer.code})`,
                }))}
                value={selectedCustomerId}
                onChange={(value) => {
                  setSelectedCustomerId(value);
                  const input = formRef.current?.querySelector<HTMLInputElement>('input[name="customerId"]');
                  if (input) input.value = value;
                }}
                placeholder={customers.length === 0 ? "هیچ مشتری‌ای ثبت نشده است" : "جستجو و انتخاب مشتری..."}
              />
            </label>

            <div className="md:col-span-2 flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800">موقعیت جغرافیایی</span>
                <span className="text-xs text-slate-500">
                  روی نقشه کلیک کنید تا مختصات ثبت شود. این اطلاعات به تیم بازاریابی کمک می‌کند مسیرها را بهتر برنامه‌ریزی کنند.
                </span>
              </div>
              <NeshanMap
                className="h-72"
                markers={selectedMarkers}
                interactive
                center={selectedLocation ?? undefined}
                onLocationSelect={(coords) => setSelectedLocation(coords)}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">عرض جغرافیایی</label>
                  <input
                    name="locationLatitudeDisplay"
                    value={selectedLocation?.latitude?.toFixed(6) ?? ""}
                    readOnly
                    placeholder="---"
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">طول جغرافیایی</label>
                  <input
                    name="locationLongitudeDisplay"
                    value={selectedLocation?.longitude?.toFixed(6) ?? ""}
                    readOnly
                    placeholder="---"
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">آدرس یا توضیح مختصر</label>
                  <input
                    name="locationAddress"
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

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              بازاریاب <span className="text-rose-500">*</span>
              <SearchableSelect
                name="marketerId"
                required
                options={marketers
                  .filter((m) => m.isActive)
                  .map((marketer) => ({
                    id: marketer.id,
                    label: `${marketer.fullName} (${marketer.region})`,
                  }))}
                value={selectedMarketerId}
                onChange={(value) => {
                  setSelectedMarketerId(value);
                  const input = formRef.current?.querySelector<HTMLInputElement>('input[name="marketerId"]');
                  if (input) input.value = value;
                }}
                placeholder={marketers.filter((m) => m.isActive).length === 0 ? "هیچ بازاریابی فعالی ثبت نشده است" : "جستجو و انتخاب بازاریاب..."}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
              تاریخ و ساعت <span className="text-rose-500">*</span>
              <PersianDateTimePicker
                name="scheduledAt"
                required
                defaultValue={scheduledAtString}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
              موضوعات (با کاما جدا کنید)
              <input
                name="topics"
                defaultValue={visit.topics?.join(", ") || ""}
                placeholder="مثال: معرفی محصول، پیگیری سفارش، خدمات پس از فروش"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
              یادداشت
              <textarea
                name="notes"
                rows={4}
                defaultValue={visit.notes || ""}
                placeholder="یادداشت‌های مربوط به ویزیت..."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
              اقدام پیگیری (اختیاری)
              <input
                name="followUpAction"
                defaultValue={visit.followUpAction || ""}
                placeholder="مثال: ارسال کاتالوگ، تماس تلفنی، ارسال پیش‌فاکتور"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                انصراف
              </Button>
              <ProtectedComponent permission="visits:write">
                <SubmitButton />
              </ProtectedComponent>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

