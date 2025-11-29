import { NextResponse } from "next/server";

import { sendOtpSms } from "@/lib/vendors/taban-sms";

/**
 * Endpoint تستی برای ارسال مستقیم SMS
 * فقط در Development در دسترس است
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const phone = body?.phone as string;
    const code = body?.code || "1234";

    if (!phone) {
      return NextResponse.json({ error: "شماره موبایل الزامی است" }, { status: 400 });
    }

    console.log("[Test SMS] شروع ارسال تستی به شماره:", phone);

    const result = await sendOtpSms(phone, code);

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      errorCode: result.errorCode,
    });
  } catch (error) {
    console.error("[Test SMS] خطا:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطای نامشخص",
      },
      { status: 500 }
    );
  }
}

