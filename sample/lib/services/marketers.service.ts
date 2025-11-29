import { ObjectId } from "mongodb";
import { z } from "zod";

import { usersRepository } from "@/lib/repositories/users.repository";
import { marketersRepository } from "@/lib/repositories/marketers.repository";
import type { User, RoleKey } from "@/lib/types";
import { normalizePhone } from "@/lib/utils/phone";

// Schemas
const createMarketerSchema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی باید حداقل سه کاراکتر باشد"),
  mobile: z.string().min(10, "شماره موبایل معتبر وارد کنید"),
  email: z.string().email("ایمیل معتبر وارد کنید").optional(),
  role: z.enum(["SUPER_ADMIN", "FINANCE_MANAGER", "MARKETER", "CUSTOMER"]).default("MARKETER"),
  region: z.string().min(1, "منطقه الزامی است"),
  isActive: z.boolean().default(true),
});

const updateMarketerSchema = createMarketerSchema.partial();

export type MarketerSummary = {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email?: string;
  role: RoleKey;
  region: string;
  isActive: boolean;
  assignedCustomersCount: number;
  performanceScore?: number;
  lastVisitAt?: Date | null;
};

export type MarketerDetail = MarketerSummary & {
  assignedCustomers: string[];
};

export type MarketerListFilters = {
  region?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export async function listMarketers(
  filters: MarketerListFilters = {},
): Promise<{ data: MarketerSummary[]; total: number; page: number; limit: number }> {
  const query: Record<string, unknown> = { role: "MARKETER" };

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 8;
  const skip = (page - 1) * limit;

  // Get total count
  const total = await usersRepository.count(query as never);

  // Get users with pagination, sorted by createdAt descending (newest first)
  const users = await usersRepository.findMany(query as never, {
    sort: { createdAt: -1 },
    skip,
    limit,
  });

  const userIds = users.map((u) => u._id);

  const profiles = userIds.length
    ? await marketersRepository.findMany({ userId: { $in: userIds } } as never)
    : [];

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  // Count assigned customers for each marketer
  const { getCustomersCollection } = await import("@/lib/db");
  const customersCollection = await getCustomersCollection();
  const customerCounts = await customersCollection
    .aggregate([
      { $match: { assignedMarketerId: { $in: userIds } } },
      { $group: { _id: "$assignedMarketerId", count: { $sum: 1 } } },
    ])
    .toArray();

  const customerCountMap = new Map(customerCounts.map((c) => [c._id, c.count]));

  let data = users.map((user) => {
    const profile = profileMap.get(user._id);
    return {
      id: user._id,
      userId: user._id,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      region: profile?.region ?? "نامشخص",
      isActive: user.isActive ?? true,
      assignedCustomersCount: customerCountMap.get(user._id) ?? 0,
      performanceScore: profile?.performanceScore,
      lastVisitAt: profile?.lastVisitAt ?? null,
    };
  });

  // Filter by region if specified
  if (filters.region) {
    data = data.filter((m) => m.region === filters.region);
  }

  return {
    data,
    total,
    page,
    limit,
  };
}

export async function getMarketerDetail(marketerId: string): Promise<MarketerDetail | null> {
  const user = await usersRepository.findById(marketerId);
  if (!user || user.role !== "MARKETER") {
    return null;
  }

  const profile = await marketersRepository.findOne({ userId: marketerId } as never);

  const { getCustomersCollection } = await import("@/lib/db");
  const customersCollection = await getCustomersCollection();
  const assignedCustomers = await customersCollection
    .find({ assignedMarketerId: marketerId })
    .project({ _id: 1 })
    .toArray();

  return {
    id: user._id,
    userId: user._id,
    fullName: user.fullName,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    region: profile?.region ?? "نامشخص",
    isActive: user.isActive ?? true,
    assignedCustomersCount: assignedCustomers.length,
    assignedCustomers: assignedCustomers.map((c) => c._id),
    performanceScore: profile?.performanceScore,
    lastVisitAt: profile?.lastVisitAt ?? null,
  };
}

export async function createMarketer(input: unknown) {
  const payload = createMarketerSchema.parse(input);

  // Check if mobile already exists
  const existingUser = await usersRepository.findByMobile(normalizePhone(payload.mobile));
  if (existingUser) {
    throw new Error("شماره موبایل قبلاً ثبت شده است.");
  }

  const now = new Date();
  const normalizedMobile = normalizePhone(payload.mobile);

  // Create User
  const userDocument: User = {
    _id: new ObjectId().toHexString(),
    fullName: payload.fullName,
    mobile: normalizedMobile,
    email: payload.email,
    role: payload.role,
    isActive: payload.isActive ?? true,
    createdAt: now,
    createdBy: "system",
    updatedAt: now,
    updatedBy: "system",
  };

  const user = await usersRepository.insertOne(userDocument);

  // Create MarketerProfile
  const profileDocument = {
    _id: user._id, // Use same ID as user
    userId: user._id,
    region: payload.region,
    assignedCustomers: [],
    createdAt: now,
    createdBy: "system",
    updatedAt: now,
    updatedBy: "system",
  };

  await marketersRepository.insertOne(profileDocument as never);

  return getMarketerDetail(user._id);
}

export async function updateMarketer(marketerId: string, input: unknown, currentUserId?: string) {
  const payload = updateMarketerSchema.parse(input);
  const user = await usersRepository.findById(marketerId);

  if (!user) {
    throw new Error("کاربر یافت نشد.");
  }

  // بررسی محدودسازی دسترسی ادمین اصلی
  // اگر کاربر در حال ویرایش خودش است و SUPER_ADMIN است، نباید بتواند نقش یا وضعیت خود را تغییر دهد
  if (currentUserId && marketerId === currentUserId && user.role === "SUPER_ADMIN") {
    if (payload.role !== undefined && payload.role !== user.role) {
      throw new Error("شما نمی‌توانید نقش خود را تغییر دهید. این محدودیت برای حفظ امنیت سیستم است.");
    }
    if (payload.isActive !== undefined && payload.isActive !== user.isActive) {
      throw new Error("شما نمی‌توانید حساب خود را غیرفعال کنید. این محدودیت برای حفظ امنیت سیستم است.");
    }
  }

  const updateUserDoc: Partial<User> = {};

  if (payload.fullName !== undefined) {
    updateUserDoc.fullName = payload.fullName;
  }

  if (payload.mobile !== undefined) {
    const normalizedMobile = normalizePhone(payload.mobile);
    // Check if mobile is already used by another user
    const existingUser = await usersRepository.findByMobile(normalizedMobile);
    if (existingUser && existingUser._id !== marketerId) {
      throw new Error("شماره موبایل قبلاً توسط کاربر دیگری ثبت شده است.");
    }
    updateUserDoc.mobile = normalizedMobile;
  }

  if (payload.email !== undefined) {
    updateUserDoc.email = payload.email;
  }

  if (payload.role !== undefined) {
    updateUserDoc.role = payload.role;
  }

  if (payload.isActive !== undefined) {
    updateUserDoc.isActive = payload.isActive;
  }

  const now = new Date();
  if (Object.keys(updateUserDoc).length > 0) {
    await usersRepository.updateById(marketerId, {
      $set: {
        ...updateUserDoc,
        updatedAt: now,
        updatedBy: "system",
      },
    } as never);
  }

  // Update profile
  if (payload.region !== undefined) {
    const profile = await marketersRepository.findOne({ userId: marketerId } as never);
    if (profile) {
      await marketersRepository.updateById(String(profile._id), {
        $set: {
          region: payload.region,
          updatedAt: now,
          updatedBy: "system",
        },
      } as never);
    } else {
      // Create profile if it doesn't exist
      const profileDoc = {
        _id: marketerId,
        userId: marketerId,
        region: payload.region,
        assignedCustomers: [],
        createdAt: now,
        createdBy: "system",
        updatedAt: now,
        updatedBy: "system",
      };
      await marketersRepository.insertOne(profileDoc as never);
    }
  }

  return getMarketerDetail(marketerId);
}

export async function deleteMarketer(marketerId: string) {
  const user = await usersRepository.findById(marketerId);
  if (!user || user.role !== "MARKETER") {
    throw new Error("بازاریاب یافت نشد.");
  }

  // Delete profile
  const profile = await marketersRepository.findOne({ userId: marketerId } as never);
  if (profile) {
    await marketersRepository.deleteById(String(profile._id));
  }

  // Delete user
  await usersRepository.deleteById(marketerId);

  return true;
}

export async function toggleMarketerStatus(marketerId: string) {
  const user = await usersRepository.findById(marketerId);
  if (!user || user.role !== "MARKETER") {
    throw new Error("بازاریاب یافت نشد.");
  }

  const now = new Date();
  await usersRepository.updateById(marketerId, {
    isActive: !user.isActive,
    updatedAt: now,
    updatedBy: "system",
  } as never);

  return getMarketerDetail(marketerId);
}

