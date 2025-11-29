import type { CustomerStatus } from "@/lib/types";
import { getCustomerDetail, listCustomerSummaries } from "@/lib/services/customers.service";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerList, CustomerCards } from "@/components/customers/customer-list";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { CustomerPagination } from "@/components/customers/customer-pagination";
import { CustomerAddButton } from "@/components/customers/customer-add-button";

const STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  PENDING: "در انتظار پیگیری",
  AT_RISK: "احتمال ریزش",
  LOYAL: "مشتری وفادار",
  SUSPENDED: "متوقف شده",
};

const STATUS_BADGE_CLASS: Partial<Record<CustomerStatus, string>> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  LOYAL: "bg-primary-100 text-primary-700 border border-primary-200",
  AT_RISK: "bg-amber-100 text-amber-700 border border-amber-200",
  PENDING: "bg-slate-100 text-slate-700 border border-slate-200",
  INACTIVE: "bg-slate-200 text-slate-700 border border-slate-300",
  SUSPENDED: "bg-rose-100 text-rose-700 border border-rose-200",
};

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value?: Date | null) {
  if (!value) {
    return "نامشخص";
  }
  return dateFormatter.format(value);
}

function formatRevenue(value?: number) {
  if (!value) {
    return "۰";
  }
  return numberFormatter.format(value);
}

function resolveBadgeClass(status: CustomerStatus) {
  return STATUS_BADGE_CLASS[status] ?? "bg-slate-100 text-slate-600";
}

type CustomersPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    city?: string;
    marketerId?: string;
    page?: string;
    selected?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 20;

  const result = await listCustomerSummaries({
    status: params.status as CustomerStatus | undefined,
    marketerId: params.marketerId,
    search: params.search,
    city: params.city,
    page,
    limit,
  });

  const selectedCustomerId = params.selected || result.data[0]?.id;
  const selectedCustomer = selectedCustomerId ? await getCustomerDetail(selectedCustomerId) : null;

  return (
    <AppShell
      title="مدیریت مشتریان"
      description="لیست مشتریان ثبت شده با امکان فیلتر، جستجو و مشاهده خلاصه تعاملات."
      activeHref="/dashboard/customers"
      actions={
        <>
          <CustomerAddButton />
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <CustomerFilters />

        {result.data.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 p-16 text-center text-slate-500">
          <h2 className="text-xl font-semibold text-slate-800">هیچ مشتری ثبت نشده است</h2>
          <p className="mt-2 max-w-md text-sm leading-7">
            برای شروع، از مسیر «افزودن مشتری جدید» یا API `/api/customers` استفاده کنید تا مشتریان به‌صورت زنده در این لیست نمایش داده شوند.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">لیست مشتریان</h2>
                <p className="text-[12px] text-slate-500">
                  {numberFormatter.format(result.data.length)} از {numberFormatter.format(result.total)} مورد
                </p>
              </div>
              <div className="text-[12px] text-slate-400">گزارش‌های خروجی به‌زودی</div>
            </header>
            <div className="relative hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[720px] divide-y divide-slate-100 text-right text-sm text-slate-600">
                <thead className="bg-slate-50 text-[12px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">شناسه</th>
                    <th className="px-4 py-3">نام مشتری</th>
                    <th className="px-4 py-3">بازاریاب مسئول</th>
                    <th className="px-4 py-3">شهر</th>
                    <th className="px-4 py-3">آخرین ویزیت</th>
                    <th className="px-4 py-3">وضعیت</th>
                    <th className="px-4 py-3">امتیاز</th>
                    <th className="px-4 py-3">درآمد ماه جاری (ریال)</th>
                    <th className="px-4 py-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <CustomerList customers={result.data} selectedCustomerId={selectedCustomerId} />
              </table>
            </div>
            <div className="p-4 lg:hidden">
              <CustomerCards customers={result.data} selectedCustomerId={selectedCustomerId} />
            </div>
            <CustomerPagination total={result.total} page={result.page} limit={result.limit} />
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            {selectedCustomer ? (
              <>
                <header className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-slate-800">{selectedCustomer.name}</h2>
                    <p className="text-xs text-slate-500">
                      کد مشتری: {selectedCustomer.code} • شهر: {selectedCustomer.city ?? "نامشخص"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resolveBadgeClass(selectedCustomer.status)}`}>
                    {STATUS_LABELS[selectedCustomer.status]}
                  </span>
                </header>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-slate-400">میانگین خرید ماهانه</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{formatRevenue(selectedCustomer.monthlyRevenue)} ریال</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-slate-400">احتمال تمدید قرارداد</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {selectedCustomer.loyaltyScore ? `${selectedCustomer.loyaltyScore}%` : "نامشخص"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-slate-400">درجه مشتری</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedCustomer.grade ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-slate-400">بازاریاب مسئول</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedCustomer.marketer ?? "تعیین نشده"}</p>
                  </div>
                </div>

                <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4">
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">اطلاعات تماس</h3>
                    <span className="text-xs text-slate-400">آخرین ویزیت: {formatDate(selectedCustomer.lastVisitAt)}</span>
                  </header>
                  <div className="flex flex-col gap-2 text-xs text-slate-500">
                    <span>شماره تماس: {selectedCustomer.phone ?? "ثبت نشده"}</span>
                    {selectedCustomer.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>

                {selectedCustomer.notes ? (
                  <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                    <h3 className="text-sm font-semibold text-slate-800">یادداشت‌های اخیر</h3>
                    <p className="leading-6 text-slate-600">{selectedCustomer.notes}</p>
                  </section>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-slate-500">
                <span>برای مشاهده جزئیات، ابتدا یک مشتری ثبت کنید.</span>
              </div>
            )}
          </section>
        </div>
        )}
      </div>
    </AppShell>
  );
}

