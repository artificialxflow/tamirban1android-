import { getCustomersCollection, getInvoicesCollection, getUsersCollection, getVisitsCollection } from "@/lib/db";
import type { InvoiceStatus, VisitStatus } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const currencyFormatter = new Intl.NumberFormat("fa-IR");
const timeFormatter = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });

type Tone = "positive" | "neutral" | "warning" | "info" | "success";

export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  tone: Tone;
};

export type DashboardVisitPreview = {
  id: string;
  customer: string;
  marketer?: string;
  timeLabel: string;
  statusLabel: string;
};

export type DashboardTask = {
  id: string;
  title: string;
  statusLabel: string;
  tone: Tone;
};

export type DashboardOverview = {
  stats: DashboardStat[];
  todayVisits: DashboardVisitPreview[];
  quickTasks: DashboardTask[];
  systemStatus: "stable" | "attention";
};

const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  SCHEDULED: "زمان‌بندی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد",
};

const STATUSES_PENDING: InvoiceStatus[] = ["SENT", "OVERDUE"];

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const customersCollection = await getCustomersCollection();
  const visitsCollection = await getVisitsCollection();
  const invoicesCollection = await getInvoicesCollection();
  const usersCollection = await getUsersCollection();

  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate = now.getDate();
  const startOfMonth = new Date(Date.UTC(localYear, localMonth, 1, 0, 0, 0, 0));
  const startOfDay = new Date(Date.UTC(localYear, localMonth, localDate, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(localYear, localMonth, localDate + 1, 0, 0, 0, 0));

  const [
    totalCustomers,
    activeCustomers,
    newCustomersThisMonth,
    todaysVisitDocs,
    upcomingVisitsCount,
    pendingInvoicesDocs,
    pendingInvoicesAggregation,
  ] = await Promise.all([
    customersCollection.countDocuments({}),
    customersCollection.countDocuments({ status: "ACTIVE" }),
    customersCollection.countDocuments({ createdAt: { $gte: startOfMonth } }),
    visitsCollection
      .find({ scheduledAt: { $gte: startOfDay, $lt: endOfDay } })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .toArray(),
    visitsCollection.countDocuments({ scheduledAt: { $gte: startOfDay } }),
    invoicesCollection
      .find({ status: { $in: STATUSES_PENDING } })
      .sort({ dueAt: 1 })
      .limit(3)
      .toArray(),
    invoicesCollection
      .aggregate([
        { $match: { status: { $in: STATUSES_PENDING } } },
        { $group: { _id: null, count: { $sum: 1 }, outstanding: { $sum: "$grandTotal" } } },
      ])
      .toArray(),
  ]);

  const pendingInvoicesMetrics = pendingInvoicesAggregation[0] ?? { count: 0, outstanding: 0 };
  const pendingInvoiceCount = pendingInvoicesMetrics.count ?? 0;
  const pendingInvoiceOutstanding = pendingInvoicesMetrics.outstanding ?? 0;

  const neededCustomerIds = new Set<string>();
  const neededMarketerIds = new Set<string>();

  todaysVisitDocs.forEach((visit) => {
    if (visit.customerId) {
      neededCustomerIds.add(visit.customerId);
    }
    if (visit.marketerId) {
      neededMarketerIds.add(visit.marketerId);
    }
  });

  pendingInvoicesDocs.forEach((invoice) => {
    if (invoice.customerId) {
      neededCustomerIds.add(invoice.customerId);
    }
  });

  const [relatedCustomers, relatedMarketers] = await Promise.all([
    neededCustomerIds.size
      ? customersCollection
          .find({ _id: { $in: Array.from(neededCustomerIds) } })
          .project({ displayName: 1 })
          .toArray()
      : Promise.resolve([]),
    neededMarketerIds.size
      ? usersCollection
          .find({ _id: { $in: Array.from(neededMarketerIds) } })
          .project({ fullName: 1 })
          .toArray()
      : Promise.resolve([]),
  ]);

  const customerNameMap = new Map(relatedCustomers.map((customer) => [customer._id, customer.displayName]));
  const marketerNameMap = new Map(relatedMarketers.map((marketer) => [marketer._id, marketer.fullName]));

  const stats: DashboardStat[] = [
    {
      label: "مشتری‌های فعال",
      value: numberFormatter.format(activeCustomers),
      helper: `${numberFormatter.format(newCustomersThisMonth)} مشتری جدید در این ماه` + (totalCustomers ? ` • مجموع: ${numberFormatter.format(totalCustomers)}` : ""),
      tone: newCustomersThisMonth > 0 ? "positive" : "neutral",
    },
    {
      label: "ویزیت‌های برنامه‌ریزی شده",
      value: numberFormatter.format(upcomingVisitsCount),
      helper: todaysVisitDocs.length
        ? `${numberFormatter.format(todaysVisitDocs.length)} ویزیت امروز`
        : "امروز ویزیت برنامه‌ریزی نشده است",
      tone: todaysVisitDocs.length ? "info" : "neutral",
    },
    {
      label: "پیش‌فاکتورهای در انتظار",
      value: numberFormatter.format(pendingInvoiceCount),
      helper: pendingInvoiceOutstanding
        ? `مبلغ معوق: ${currencyFormatter.format(pendingInvoiceOutstanding)} ریال`
        : "مبلغ معوق ثبت نشده است",
      tone: pendingInvoiceOutstanding ? "warning" : "neutral",
    },
  ];

  const todayVisits: DashboardVisitPreview[] = todaysVisitDocs.map((visit) => ({
    id: visit._id,
    customer: customerNameMap.get(visit.customerId) ?? "مشتری ناشناس",
    marketer: visit.marketerId ? marketerNameMap.get(visit.marketerId) ?? "بازاریاب نامشخص" : undefined,
    timeLabel: timeFormatter.format(visit.scheduledAt),
    statusLabel: VISIT_STATUS_LABELS[visit.status],
  }));

  const quickTasks: DashboardTask[] = pendingInvoicesDocs.map((invoice) => {
    const customerName = invoice.customerId ? customerNameMap.get(invoice.customerId) : undefined;
    const isOverdue = invoice.status === "OVERDUE" || (invoice.dueAt && invoice.dueAt < now);
    const dueLabel = invoice.dueAt ? dateFormatter.format(invoice.dueAt) : "در انتظار تایید";

    return {
      id: invoice._id,
      title: `پیگیری پیش‌فاکتور برای ${customerName ?? "مشتری ناشناس"}`,
      statusLabel: isOverdue ? `معوق از ${dueLabel}` : `سررسید ${dueLabel}`,
      tone: isOverdue ? "warning" : "info",
    };
  });

  if (!quickTasks.length) {
    quickTasks.push({
      id: "no-task",
      title: "وظیفه فوری ثبت نشده است",
      statusLabel: "در صورت ثبت پیش‌فاکتور جدید، اینجا نمایش داده می‌شود",
      tone: "success",
    });
  }

  return {
    stats,
    todayVisits,
    quickTasks,
    systemStatus: pendingInvoiceOutstanding > 0 ? "attention" : "stable",
  };
}
