"use server";

import { revalidatePath } from "next/cache";

import { createVisit, updateVisit } from "@/lib/services/visits.service";

export type CreateVisitFormState = {
  success: boolean;
  message: string | null;
};

export type UpdateVisitFormState = {
  success: boolean;
  message: string | null;
};

export async function createVisitAction(
  _prevState: CreateVisitFormState,
  formData: FormData,
): Promise<CreateVisitFormState> {
  try {
    const customerId = formData.get("customerId") as string;
    const marketerId = formData.get("marketerId") as string;
    const scheduledAt = formData.get("scheduledAt") as string;
    const notes = formData.get("notes") as string;
    const topics = formData.get("topics") as string;
    const followUpAction = formData.get("followUpAction") as string;

    if (!customerId || !marketerId || !scheduledAt) {
      return {
        success: false,
        message: "مشتری، بازاریاب و تاریخ و ساعت الزامی هستند.",
      };
    }

    const locationLatitude = formData.get("locationLatitude") as string;
    const locationLongitude = formData.get("locationLongitude") as string;
    const locationAddress = formData.get("locationAddress") as string;

    const locationSnapshot =
      locationLatitude && locationLongitude
        ? {
            latitude: parseFloat(locationLatitude),
            longitude: parseFloat(locationLongitude),
            address: locationAddress || undefined,
          }
        : undefined;

    const payload = {
      customerId,
      marketerId,
      scheduledAt: new Date(scheduledAt),
      notes: notes || undefined,
      topics: topics ? topics.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      followUpAction: followUpAction || undefined,
      locationSnapshot,
    };

    await createVisit(payload);
    revalidatePath("/dashboard/visits");

    return {
      success: true,
      message: "ویزیت با موفقیت ثبت شد.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ثبت ویزیت با خطا مواجه شد.";
    return {
      success: false,
      message,
    };
  }
}

export async function updateVisitAction(
  _prevState: UpdateVisitFormState,
  formData: FormData,
): Promise<UpdateVisitFormState> {
  try {
    const visitId = formData.get("visitId") as string;
    if (!visitId) {
      return { success: false, message: "شناسه ویزیت الزامی است." };
    }

    const customerId = formData.get("customerId") as string;
    const marketerId = formData.get("marketerId") as string;
    const scheduledAt = formData.get("scheduledAt") as string;
    const notes = formData.get("notes") as string;
    const topics = formData.get("topics") as string;
    const followUpAction = formData.get("followUpAction") as string;

    if (!customerId || !marketerId || !scheduledAt) {
      return {
        success: false,
        message: "مشتری، بازاریاب و تاریخ و ساعت الزامی هستند.",
      };
    }

    const locationLatitude = formData.get("locationLatitude") as string;
    const locationLongitude = formData.get("locationLongitude") as string;
    const locationAddress = formData.get("locationAddress") as string;

    const locationSnapshot =
      locationLatitude && locationLongitude
        ? {
            latitude: parseFloat(locationLatitude),
            longitude: parseFloat(locationLongitude),
            address: locationAddress || undefined,
          }
        : undefined;

    const payload = {
      customerId,
      marketerId,
      scheduledAt: new Date(scheduledAt),
      notes: notes || undefined,
      topics: topics ? topics.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      followUpAction: followUpAction || undefined,
      locationSnapshot,
    };

    await updateVisit(visitId, payload);
    revalidatePath("/dashboard/visits");

    return {
      success: true,
      message: "ویزیت با موفقیت به‌روزرسانی شد.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "به‌روزرسانی ویزیت با خطا مواجه شد.";
    return {
      success: false,
      message,
    };
  }
}

