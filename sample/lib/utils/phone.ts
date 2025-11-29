import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.");

export function normalizePhone(phone: string) {
  return phoneSchema.parse(phone);
}
