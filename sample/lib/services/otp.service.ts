import bcrypt from "bcryptjs";

import { incrementAttempt, upsertOtpAttempt, getOtpAttempt, clearOtpAttempt } from "@/lib/repositories/otp-attempts.repository";
import { createUserWithPhone, findUserByPhone } from "@/lib/repositories/users.repository";
import { smsLogsRepository } from "@/lib/repositories/sms-logs.repository";
import { issueTokenPair } from "@/lib/services/auth.service";
import { generateOtpCode } from "@/lib/utils/otp";
import { normalizePhone } from "@/lib/utils/phone";
import { sendOtpSms } from "@/lib/vendors/taban-sms";

const SALT_ROUNDS = 8;
const FIXED_CODE = "0000";
const OTP_LENGTH = 4;

// بررسی اینکه آیا در حالت تست هستیم یا نه (برای نمایش کد در پاسخ)
const isTestMode = () => {
  return process.env.NODE_ENV === "development" && process.env.OTP_TEST_CODE === "0000";
};

// بررسی اینکه آیا باید SMS واقعی ارسال شود
const shouldSendRealSms = () => {
  const hasApiKey = !!process.env.TABAN_SMS_API_KEY;
  console.log("[OTP Service] بررسی SMS واقعی:", {
    hasApiKey,
    apiKeyLength: process.env.TABAN_SMS_API_KEY?.length || 0,
    baseUrl: process.env.TABAN_SMS_BASE_URL,
    senderNumber: process.env.TABAN_SMS_SENDER_NUMBER,
  });
  return hasApiKey;
};

export async function requestOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  // تولید کد OTP
  // اگر در حالت تست باشیم و SMS واقعی فعال نباشد، از کد ثابت استفاده می‌کنیم
  // در غیر این صورت، کد تصادفی تولید می‌کنیم
  const useFixedCode = isTestMode() && !shouldSendRealSms();
  const code = useFixedCode ? FIXED_CODE : generateOtpCode(OTP_LENGTH);
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  
  // ذخیره کد در دیتابیس
  await upsertOtpAttempt(normalizedPhone, codeHash);

  // ارسال پیامک واقعی اگر API Key موجود باشد
  if (shouldSendRealSms()) {
    console.log("[OTP Service] شروع ارسال SMS واقعی به شماره:", normalizedPhone);
    try {
      const smsResult = await sendOtpSms(normalizedPhone, code);
      console.log("[OTP Service] نتیجه ارسال SMS:", smsResult);
      
      // ثبت لاگ ارسال
      await smsLogsRepository.insertOne({
        phoneNumber: normalizedPhone,
        channel: "SMS",
        template: "OTP",
        payload: {
          codeLength: OTP_LENGTH,
          provider: "TABAN_SMS",
        },
        status: smsResult.success ? "QUEUED" : "FAILED",
        sentAt: new Date(),
        errorMessage: smsResult.error,
        requestId: smsResult.messageId,
        createdAt: new Date(),
        createdBy: "system",
      } as any);

      // اگر ارسال ناموفق بود، خطا throw کنیم
      if (!smsResult.success) {
        console.error("[OTP Service] ارسال SMS ناموفق:", smsResult.error, smsResult.errorCode);
        throw new Error(smsResult.error || "خطا در ارسال پیامک");
      }
      
      console.log("[OTP Service] SMS با موفقیت ارسال شد. MessageId:", smsResult.messageId);
    } catch (error) {
      console.error("[OTP Service] خطا در فرآیند ارسال SMS:", error);
      
      // ثبت لاگ خطا
      await smsLogsRepository.insertOne({
        phoneNumber: normalizedPhone,
        channel: "SMS",
        template: "OTP",
        payload: {
          codeLength: OTP_LENGTH,
          provider: "TABAN_SMS",
        },
        status: "FAILED",
        sentAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "خطای نامشخص در ارسال پیامک",
        createdAt: new Date(),
        createdBy: "system",
      } as any).catch((logError) => {
        console.error("[OTP Service] خطا در ثبت لاگ:", logError);
      });

      // اگر SMS واقعی فعال باشد، خطا را throw می‌کنیم
      throw new Error(error instanceof Error ? error.message : "خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.");
    }
  } else {
    console.log("[OTP Service] SMS واقعی غیرفعال است. API Key موجود نیست یا در حالت تست هستیم.");
  }

  // در حالت تست (بدون SMS واقعی)، کد را برمی‌گردانیم (برای تست)
  // اگر SMS واقعی ارسال شده باشد، کد را برنمی‌گردانیم
  const shouldReturnCode = isTestMode() && !shouldSendRealSms();
  
  return { 
    success: true, 
    ...(shouldReturnCode ? { code } : {}) 
  };
}

export async function verifyOtp(phone: string, code: string) {
  if (!phone || !code) {
    throw new Error("شماره موبایل و کد الزامی است.");
  }

  const normalizedPhone = normalizePhone(phone);

  // بررسی کد تست 0000 (همیشه فعال برای تست)
  const isTestCode = code === FIXED_CODE;
  
  if (isTestCode) {
    // در حالت تست، مستقیماً کاربر را پیدا یا ایجاد می‌کنیم
    console.log("[OTP Service] استفاده از کد تست 0000 برای شماره:", normalizedPhone);
    
    let user = await findUserByPhone(normalizedPhone);
    if (!user) {
      user = await createUserWithPhone(normalizedPhone);
    }

    // پاک کردن هر attempt قبلی
    await clearOtpAttempt(normalizedPhone);

    const tokenPair = await issueTokenPair(user._id, user.mobile);

    return { ...tokenPair, user };
  }

  // بررسی عادی OTP
  const attemptRecord = await getOtpAttempt(normalizedPhone);
  if (!attemptRecord) {
    throw new Error("کدی برای این شماره ارسال نشده است.");
  }

  if (attemptRecord.expiresAt && attemptRecord.expiresAt < new Date()) {
    throw new Error("کد منقضی شده است.");
  }

  await incrementAttempt(normalizedPhone);

  const isValid = await bcrypt.compare(code, attemptRecord.codeHash);
  if (!isValid) {
    throw new Error("کد وارد شده صحیح نیست.");
  }

  let user = await findUserByPhone(normalizedPhone);
  if (!user) {
    user = await createUserWithPhone(normalizedPhone);
  }

  await clearOtpAttempt(normalizedPhone);

  const tokenPair = await issueTokenPair(user._id, user.mobile);

  return { ...tokenPair, user };
}

