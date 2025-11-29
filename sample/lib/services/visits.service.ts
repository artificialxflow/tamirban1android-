import { ObjectId } from "mongodb";
import { z } from "zod";

import { visitsRepository } from "@/lib/repositories/visits.repository";
import { customersRepository } from "@/lib/repositories/customers.repository";
import { usersRepository } from "@/lib/repositories/users.repository";
import { getCustomersCollection, getUsersCollection, getVisitsCollection } from "@/lib/db";
import type { Visit, VisitStatus } from "@/lib/types";
import type { PaginatedResult } from "@/lib/types";

const timeFormatter = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { month: "2-digit", day: "2-digit" });

const STATUS_LABEL: Record<VisitStatus, string> = {
  SCHEDULED: "زمان‌بندی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد",
};

const STATUS_TONE: Record<VisitStatus, "info" | "success" | "warning"> = {
  SCHEDULED: "info",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "warning",
};

export type VisitSummaryCard = {
  title: string;
  value: string;
  helper: string;
  helperColor: string;
};

export type VisitReminder = {
  id: string;
  title: string;
  deadlineLabel: string;
  owner?: string;
};

export type VisitScheduleItem = {
  id: string;
  timeLabel: string;
  customer: string;
  marketer?: string;
  category?: string;
  statusLabel: string;
  statusTone: "info" | "success" | "warning";
  notes?: string;
  followUpLabel?: string;
};

export type VisitsOverview = {
  summaryCards: VisitSummaryCard[];
  reminders: VisitReminder[];
  schedule: VisitScheduleItem[];
};

function resolveHelperColor(tone: "info" | "success" | "warning" | "neutral") {
  switch (tone) {
    case "success":
      return "text-emerald-500";
    case "warning":
      return "text-orange-500";
    case "info":
      return "text-slate-500";
    default:
      return "text-slate-500";
  }
}

export async function getVisitsOverview(currentUserId?: string): Promise<VisitsOverview> {
  try {
    const visitsCollection = await getVisitsCollection();
    const customersCollection = await getCustomersCollection();
    const usersCollection = await getUsersCollection();

    const now = new Date();
    // ساخت startOfDay و endOfDay
    // تاریخ‌ها در MongoDB به صورت UTC ذخیره می‌شوند (از toISOString())
    // باید از local date برای ساخت startOfDay و endOfDay استفاده کنیم
    // اما MongoDB query با Date object کار می‌کند و خودش timezone را مدیریت می‌کند
    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDate = now.getDate();
    
    // ساخت Date با local timezone برای start of day
    // MongoDB این Date object را به UTC تبدیل می‌کند و با تاریخ‌های ذخیره شده مقایسه می‌کند
    const startOfDay = new Date(localYear, localMonth, localDate, 0, 0, 0, 0);
    const endOfDay = new Date(localYear, localMonth, localDate + 1, 0, 0, 0, 0);
    
    // برای اطمینان از match شدن، از range وسیع‌تری استفاده می‌کنیم
    // که شامل کل روز در هر timezone باشد (24 ساعت + offset)
    const timezoneOffset = now.getTimezoneOffset() * 60000; // به میلی‌ثانیه
    const startOfDayAdjusted = new Date(startOfDay.getTime() - timezoneOffset);
    const endOfDayAdjusted = new Date(endOfDay.getTime() - timezoneOffset);

    // فیلتر بر اساس نقش کاربر
    // استفاده از adjusted dates برای اطمینان از match شدن با تاریخ‌های UTC
    const baseQuery: Record<string, unknown> = { scheduledAt: { $gte: startOfDayAdjusted, $lt: endOfDayAdjusted } };
    
    // اگر currentUserId پاس داده شده (چه از MARKETER باشد چه از فیلتر دستی)، فیلتر کن
    if (currentUserId) {
      baseQuery.marketerId = currentUserId;
    }
    // اگر currentUserId نباشد، همه ویزیت‌های امروز را نشان بده

    // Debug: لاگ برای بررسی query (فقط در development)
    if (process.env.NODE_ENV === "development") {
      console.log("[getVisitsOverview] Query:", {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        startOfDayAdjusted: startOfDayAdjusted.toISOString(),
        endOfDayAdjusted: endOfDayAdjusted.toISOString(),
        timezoneOffset: now.getTimezoneOffset(),
        currentUserId,
        baseQueryKeys: Object.keys(baseQuery),
      });
    }

    const [todayVisits, completedTodayCount, cancelledTodayCount, allTodayVisitsCount, averageDurations] = await Promise.all([
    visitsCollection
      .find(baseQuery)
      .sort({ scheduledAt: 1 })
      .limit(20)
      .toArray(),
    visitsCollection.countDocuments({ ...baseQuery, status: "COMPLETED", completedAt: { $gte: startOfDayAdjusted, $lt: endOfDayAdjusted } }),
    visitsCollection.countDocuments({ ...baseQuery, status: "CANCELLED" }),
    visitsCollection.countDocuments(baseQuery),
    visitsCollection
      .aggregate([
        { $match: { status: "COMPLETED", completedAt: { $exists: true }, scheduledAt: { $exists: true } } },
        {
          $project: {
            duration: {
              $divide: [{ $subtract: ["$completedAt", "$scheduledAt"] }, 60000],
            },
          },
        },
        { $group: { _id: null, avg: { $avg: "$duration" } } },
      ])
      .toArray(),
  ]);

  const customerIds = Array.from(new Set(todayVisits.map((visit) => visit.customerId).filter(Boolean)));
  const marketerIds = Array.from(new Set(todayVisits.map((visit) => visit.marketerId).filter(Boolean)));

  const [customerDocs, marketerDocs] = await Promise.all([
    customerIds.length
      ? customersCollection.find({ _id: { $in: customerIds } }).project({ displayName: 1 }).toArray()
      : Promise.resolve([]),
    marketerIds.length
      ? usersCollection.find({ _id: { $in: marketerIds } }).project({ fullName: 1 }).toArray()
      : Promise.resolve([]),
  ]);

  const customerNameMap = new Map(customerDocs.map((doc) => [doc._id, doc.displayName]));
  const marketerNameMap = new Map(marketerDocs.map((doc) => [doc._id, doc.fullName]));

  const averageDurationMinutes = averageDurations[0]?.avg ?? null;

  const summaryCards: VisitSummaryCard[] = [
    {
      title: "ویزیت‌های امروز",
      value: allTodayVisitsCount ? allTodayVisitsCount.toString() : "۰",
      helper: allTodayVisitsCount ? `${allTodayVisitsCount} ویزیت در تقویم امروز ثبت شده است.` : "برای امروز ویزیتی ثبت نشده است.",
      helperColor: resolveHelperColor(allTodayVisitsCount > 0 ? "info" : "neutral"),
    },
    {
      title: "ویزیت‌های تکمیل‌شده",
      value: completedTodayCount ? completedTodayCount.toString() : "۰",
      helper: completedTodayCount ? "گزارش‌ها به‌صورت خودکار در CRM ثبت شد." : "برای امروز گزارشی ثبت نشده است.",
      helperColor: resolveHelperColor(completedTodayCount > 0 ? "success" : "neutral"),
    },
    {
      title: "ویزیت‌های لغوشده",
      value: cancelledTodayCount ? cancelledTodayCount.toString() : "۰",
      helper: cancelledTodayCount ? "نیازمند پیگیری تیم بازاریابی." : "لغوی گزارش نشده است.",
      helperColor: resolveHelperColor(cancelledTodayCount > 0 ? "warning" : "neutral"),
    },
    {
      title: "میانگین زمان ویزیت",
      value: averageDurationMinutes ? `${Math.round(averageDurationMinutes)} دقیقه` : "نامشخص",
      helper: averageDurationMinutes ? "بر اساس ویزیت‌های تکمیل‌شده.": "برای محاسبه نیاز به ویزیت تکمیل‌شده است.",
      helperColor: resolveHelperColor(averageDurationMinutes ? "success" : "neutral"),
    },
  ];

  const schedule: VisitScheduleItem[] = todayVisits.map((visit) => ({
    id: visit._id,
    timeLabel: timeFormatter.format(visit.scheduledAt),
    customer: customerNameMap.get(visit.customerId) ?? "مشتری ناشناس",
    marketer: visit.marketerId ? marketerNameMap.get(visit.marketerId) ?? "بازاریاب نامشخص" : undefined,
    category: visit.topics?.[0],
    statusLabel: STATUS_LABEL[visit.status],
    statusTone: STATUS_TONE[visit.status],
    notes: visit.notes,
    followUpLabel: visit.followUpAction,
  }));

  // فیلتر برای ویزیت‌های آینده
  const futureQuery: Record<string, unknown> = { scheduledAt: { $gte: endOfDay } };
  if (currentUserId) {
    futureQuery.marketerId = currentUserId;
  }

  const futureVisits = await visitsCollection
    .find(futureQuery)
    .sort({ scheduledAt: 1 })
    .limit(5)
    .toArray();

  const reminders: VisitReminder[] = futureVisits.map((visit) => ({
    id: visit._id,
    title: `پیگیری ویزیت ${customerNameMap.get(visit.customerId) ?? "مشتری"}`,
    deadlineLabel: `سررسید ${dateFormatter.format(visit.scheduledAt)}`,
    owner: visit.marketerId ? marketerNameMap.get(visit.marketerId) : undefined,
  }));

    if (!reminders.length) {
      reminders.push({
        id: "reminder-empty",
        title: "ثبت یادآوری جدید",
        deadlineLabel: "برای مدیریت بهتر برنامه، یادآوری ایجاد کنید.",
      });
    }

    return { summaryCards, reminders, schedule };
  } catch (error) {
    console.error("[getVisitsOverview] Error:", error);
    // در صورت خطا، یک response خالی برگردان
    return {
      summaryCards: [
        {
          title: "ویزیت‌های امروز",
          value: "0",
          helper: "خطا در اتصال به دیتابیس",
          helperColor: "text-rose-500",
        },
        {
          title: "تکمیل شده",
          value: "0",
          helper: "خطا در اتصال به دیتابیس",
          helperColor: "text-rose-500",
        },
        {
          title: "لغو شده",
          value: "0",
          helper: "خطا در اتصال به دیتابیس",
          helperColor: "text-rose-500",
        },
        {
          title: "میانگین زمان",
          value: "0 دقیقه",
          helper: "خطا در اتصال به دیتابیس",
          helperColor: "text-rose-500",
        },
      ],
      reminders: [
        {
          id: "error",
          title: "خطا در اتصال به دیتابیس",
          deadlineLabel: "لطفاً اتصال اینترنت و تنظیمات دیتابیس را بررسی کنید.",
        },
      ],
      schedule: [],
    };
  }
}

// Schemas
const createVisitSchema = z.object({
  customerId: z.string().min(1, "شناسه مشتری الزامی است"),
  marketerId: z.string().min(1, "شناسه بازاریاب الزامی است"),
  scheduledAt: z.coerce.date({ message: "تاریخ و زمان ویزیت الزامی است" }),
  topics: z.array(z.string()).default([]),
  notes: z.string().optional(),
  locationSnapshot: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
    })
    .optional(),
  followUpAction: z.string().optional(),
});

const updateVisitSchema = createVisitSchema.partial();

const changeVisitStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  completedAt: z.coerce.date().optional(),
});

export type VisitListFilters = {
  customerId?: string;
  marketerId?: string;
  status?: VisitStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

export type VisitSummary = {
  id: string;
  customerId: string;
  customerName: string;
  marketerId: string;
  marketerName?: string;
  scheduledAt: Date;
  completedAt?: Date | null;
  status: VisitStatus;
  topics: string[];
  notes?: string;
  followUpAction?: string;
  locationSnapshot?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

export type VisitDetail = VisitSummary & {
  locationSnapshot?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

// Service Functions
export async function listVisits(
  filters: VisitListFilters = {},
): Promise<PaginatedResult<VisitSummary>> {
  const query: Record<string, unknown> = {};

  if (filters.customerId) {
    query.customerId = filters.customerId;
  }

  if (filters.marketerId) {
    query.marketerId = filters.marketerId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    query.scheduledAt = {};
    if (filters.startDate) {
      (query.scheduledAt as Record<string, unknown>).$gte = filters.startDate;
    }
    if (filters.endDate) {
      (query.scheduledAt as Record<string, unknown>).$lte = filters.endDate;
    }
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const total = await visitsRepository.count(query as never);
  const visits = await visitsRepository.findMany(query as never, {
    sort: { createdAt: -1, scheduledAt: -1 }, // اول بر اساس تاریخ ایجاد (جدیدترین در بالا)، سپس بر اساس زمان برنامه‌ریزی شده
    skip,
    limit,
  });

  // Get customer and marketer names
  const customerIds = Array.from(new Set(visits.map((v) => v.customerId)));
  const marketerIds = Array.from(new Set(visits.map((v) => v.marketerId).filter(Boolean)));

  const [customers, marketers] = await Promise.all([
    customerIds.length
      ? customersRepository.findMany({ _id: { $in: customerIds } } as never)
      : Promise.resolve([]),
    marketerIds.length
      ? usersRepository.findMany({ _id: { $in: marketerIds } } as never)
      : Promise.resolve([]),
  ]);

  const customerMap = new Map(customers.map((c) => [c._id, c.displayName]));
  const marketerMap = new Map(marketers.map((m) => [m._id, m.fullName]));

  const data: VisitSummary[] = visits.map((visit) => ({
    id: visit._id,
    customerId: visit.customerId,
    customerName: customerMap.get(visit.customerId) ?? "مشتری ناشناس",
    marketerId: visit.marketerId,
    marketerName: visit.marketerId ? marketerMap.get(visit.marketerId) : undefined,
    scheduledAt: visit.scheduledAt,
    completedAt: visit.completedAt ?? null,
    status: visit.status,
    topics: visit.topics ?? [],
    notes: visit.notes,
    followUpAction: visit.followUpAction,
    locationSnapshot: visit.locationSnapshot
      ? {
          latitude: visit.locationSnapshot.latitude,
          longitude: visit.locationSnapshot.longitude,
          address: (visit.locationSnapshot as { address?: string }).address,
        }
      : undefined,
  }));

  return {
    data,
    total,
    page,
    limit,
  };
}

export async function getVisitDetail(visitId: string): Promise<VisitDetail | null> {
  const visit = await visitsRepository.findById(visitId);
  if (!visit) {
    return null;
  }

  const [customer, marketer] = await Promise.all([
    customersRepository.findById(visit.customerId),
    visit.marketerId ? usersRepository.findById(visit.marketerId) : Promise.resolve(null),
  ]);

  return {
    id: visit._id,
    customerId: visit.customerId,
    customerName: customer?.displayName ?? "مشتری ناشناس",
    marketerId: visit.marketerId,
    marketerName: marketer?.fullName,
    scheduledAt: visit.scheduledAt,
    completedAt: visit.completedAt ?? null,
    status: visit.status,
    topics: visit.topics ?? [],
    notes: visit.notes,
    followUpAction: visit.followUpAction,
    locationSnapshot: visit.locationSnapshot
      ? {
          latitude: visit.locationSnapshot.latitude,
          longitude: visit.locationSnapshot.longitude,
          address: (visit.locationSnapshot as { address?: string }).address,
        }
      : undefined,
  };
}

export async function createVisit(input: unknown) {
  const payload = createVisitSchema.parse(input);

  // Validate customer exists
  const customer = await customersRepository.findById(payload.customerId);
  if (!customer) {
    throw new Error("مشتری یافت نشد.");
  }

  // Validate marketer exists
  const marketer = await usersRepository.findById(payload.marketerId);
  if (!marketer) {
    throw new Error("بازاریاب یافت نشد.");
  }

  const now = new Date();
  const document: Visit = {
    _id: new ObjectId().toHexString(),
    customerId: payload.customerId,
    marketerId: payload.marketerId,
    scheduledAt: payload.scheduledAt,
    status: "SCHEDULED",
    topics: payload.topics ?? [],
    notes: payload.notes,
    locationSnapshot: payload.locationSnapshot,
    followUpAction: payload.followUpAction,
    createdAt: now,
    createdBy: "system",
    updatedAt: now,
    updatedBy: "system",
  };

  await visitsRepository.insertOne(document);

  // Update customer's lastVisitAt
  await customersRepository.updateById(payload.customerId, {
    $set: {
      lastVisitAt: payload.scheduledAt,
      updatedAt: now,
      updatedBy: "system",
    },
  } as never);

  return getVisitDetail(document._id);
}

export async function updateVisit(visitId: string, input: unknown) {
  const payload = updateVisitSchema.parse(input);
  const visit = await visitsRepository.findById(visitId);

  if (!visit) {
    throw new Error("ویزیت یافت نشد.");
  }

  const updateDoc: Partial<Visit> = {};

  if (payload.customerId !== undefined) {
    const customer = await customersRepository.findById(payload.customerId);
    if (!customer) {
      throw new Error("مشتری یافت نشد.");
    }
    updateDoc.customerId = payload.customerId;
  }

  if (payload.marketerId !== undefined) {
    const marketer = await usersRepository.findById(payload.marketerId);
    if (!marketer) {
      throw new Error("بازاریاب یافت نشد.");
    }
    updateDoc.marketerId = payload.marketerId;
  }

  if (payload.scheduledAt !== undefined) {
    updateDoc.scheduledAt = payload.scheduledAt;
  }

  if (payload.topics !== undefined) {
    updateDoc.topics = payload.topics;
  }

  if (payload.notes !== undefined) {
    updateDoc.notes = payload.notes;
  }

  if (payload.locationSnapshot !== undefined) {
    updateDoc.locationSnapshot = payload.locationSnapshot;
  }

  if (payload.followUpAction !== undefined) {
    updateDoc.followUpAction = payload.followUpAction;
  }

  const now = new Date();
  await visitsRepository.updateById(visitId, {
    ...updateDoc,
    updatedAt: now,
    updatedBy: "system",
  } as never);

  return getVisitDetail(visitId);
}

export async function changeVisitStatus(visitId: string, input: unknown) {
  const payload = changeVisitStatusSchema.parse(input);
  const visit = await visitsRepository.findById(visitId);

  if (!visit) {
    throw new Error("ویزیت یافت نشد.");
  }

  const updateDoc: Partial<Visit> = {
    status: payload.status,
  };

  if (payload.status === "COMPLETED" && !visit.completedAt) {
    updateDoc.completedAt = payload.completedAt ?? new Date();
  } else if (payload.status !== "COMPLETED") {
    updateDoc.completedAt = undefined;
  }

  const now = new Date();
  await visitsRepository.updateById(visitId, {
    ...updateDoc,
    updatedAt: now,
    updatedBy: "system",
  } as never);

  return getVisitDetail(visitId);
}

export async function deleteVisit(visitId: string) {
  const deleted = await visitsRepository.deleteById(visitId);
  if (!deleted) {
    throw new Error("ویزیت یافت نشد.");
  }
  return true;
}
