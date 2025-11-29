"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PersianDateTimePicker } from "@/components/visits/persian-date-time-picker";
import { ProtectedComponent } from "@/components/common/protected-component";
import type { InvoiceDetail } from "@/lib/services/invoices.service";

interface InvoiceLineItem {
  title: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

interface InvoiceEditModalProps {
  invoice: InvoiceDetail;
  isOpen: boolean;
  onClose: () => void;
  customers: Array<{ id: string; name: string }>;
  marketers?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function InvoiceEditModal({
  invoice,
  isOpen,
  onClose,
  customers,
  marketers = [],
  onSuccess,
}: InvoiceEditModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<InvoiceLineItem[]>(
    invoice.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0,
      discount: item.discount || 0,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(
        invoice.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          discount: item.discount || 0,
        })),
      );
      setError(null);
    }
  }, [isOpen, invoice]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { title: "", quantity: 1, unit: "عدد", unitPrice: 0, taxRate: 9, discount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemAfterDiscount = itemSubtotal - itemDiscount;
      const itemTax = (itemAfterDiscount * (item.taxRate || 0)) / 100;

      subtotal += itemSubtotal;
      discountTotal += itemDiscount;
      taxTotal += itemTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const customerId = formData.get("customerId") as string;
    const marketerId = formData.get("marketerId") as string;
    const dueAt = formData.get("dueAt") as string;
    const notes = formData.get("notes") as string;

    if (!customerId || !dueAt) {
      setError("لطفا فیلدهای اجباری را پر کنید");
      setLoading(false);
      return;
    }

    const dueAtDate = new Date(dueAt);
    if (isNaN(dueAtDate.getTime())) {
      setError("تاریخ سررسید معتبر نیست");
      setLoading(false);
      return;
    }

    if (items.some((item) => !item.title || item.unitPrice <= 0)) {
      setError("لطفا تمام آیتم‌ها را به درستی پر کنید");
      setLoading(false);
      return;
    }

    const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("لطفاً ابتدا وارد شوید.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          marketerId: marketerId || undefined,
          dueAt: dueAtDate.toISOString(),
          items: items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discount: item.discount,
            total: item.quantity * item.unitPrice - (item.discount || 0) + (item.quantity * item.unitPrice - (item.discount || 0)) * ((item.taxRate || 0) / 100),
          })),
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
          meta: {
            ...invoice.meta,
            notes,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "خطا در ویرایش پیش‌فاکتور");
      }

      const data = await response.json();
      if (data.success) {
        router.refresh();
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(data.message || "خطا در ویرایش پیش‌فاکتور");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  return (
    <ProtectedComponent permission="invoices:write" showMessage>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-2xl">
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
            <h2 className="text-xl font-semibold text-slate-800">ویرایش پیش‌فاکتور</h2>
          </header>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                مشتری *
                <select
                  name="customerId"
                  required
                  defaultValue={invoice.customerId}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              {marketers.length > 0 && (
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  بازاریاب
                  <select
                    name="marketerId"
                    defaultValue={invoice.marketerId || ""}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">انتخاب بازاریاب</option>
                    {marketers.map((marketer) => (
                      <option key={marketer.id} value={marketer.id}>
                        {marketer.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                تاریخ سررسید *
                <PersianDateTimePicker
                  name="dueAt"
                  required
                  defaultValue={new Date(invoice.dueAt).toISOString()}
                />
              </label>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">آیتم‌های فاکتور</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="rounded-full border-2 border-primary-300 bg-primary-100 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md"
                >
                  + افزودن آیتم
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-600">آیتم {index + 1}</h4>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="rounded-full p-1.5 text-rose-500 transition hover:bg-rose-50"
                          title="حذف آیتم"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        عنوان آیتم *
                        <input
                          type="text"
                          placeholder="مثال: سرویس دوره‌ای تجهیزات"
                          value={item.title}
                          onChange={(e) => handleItemChange(index, "title", e.target.value)}
                          required
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        تعداد *
                        <input
                          type="number"
                          placeholder="مثال: 1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                          required
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        واحد *
                        <input
                          type="text"
                          placeholder="مثال: بسته، عدد، کیلوگرم"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                          required
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        قیمت واحد *
                        <input
                          type="number"
                          placeholder="مثال: 100000"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1000"
                          required
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        تخفیف
                        <input
                          type="number"
                          placeholder="مثال: 5000"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, "discount", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1000"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        نرخ مالیات (%)
                        <input
                          type="number"
                          placeholder="مثال: 9"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">جمع کل:</span>
                  <span className="font-semibold text-slate-800">{subtotal.toLocaleString("fa-IR")}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">تخفیف:</span>
                    <span className="font-semibold text-emerald-600">-{discountTotal.toLocaleString("fa-IR")}</span>
                  </div>
                )}
                {taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">مالیات:</span>
                    <span className="font-semibold text-slate-800">{taxTotal.toLocaleString("fa-IR")}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">مبلغ نهایی:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {grandTotal.toLocaleString("fa-IR")} {invoice.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              یادداشت
              <textarea
                name="notes"
                rows={3}
                defaultValue={(invoice.meta?.notes as string) || ""}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedComponent>
  );
}

