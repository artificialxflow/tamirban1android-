import { NextResponse } from "next/server";

/**
 * Endpoint تستی برای بررسی متغیرهای محیطی
 * فقط در Development در دسترس است
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasTabanBaseUrl: !!process.env.TABAN_SMS_BASE_URL,
      hasTabanApiKey: !!process.env.TABAN_SMS_API_KEY,
      hasTabanSenderNumber: !!process.env.TABAN_SMS_SENDER_NUMBER,
      tabanBaseUrl: process.env.TABAN_SMS_BASE_URL,
      tabanSenderNumber: process.env.TABAN_SMS_SENDER_NUMBER,
      tabanApiKeyLength: process.env.TABAN_SMS_API_KEY?.length || 0,
      otpTestCode: process.env.OTP_TEST_CODE,
    },
  });
}

