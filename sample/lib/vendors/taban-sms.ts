/**
 * کلاینت تابان اس‌ام‌اس (IPPanel Edge API)
 * مستندات: https://ippanelcom.github.io/Edge-Document/docs/send/webservice
 */

interface SendSmsParams {
  phone: string; // شماره گیرنده (فرمت: 09123456789)
  message: string; // متن پیامک
}

interface TabaanSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

interface TabaanApiResponse {
  data: {
    message_outbox_ids?: number[];
  } | null;
  meta: {
    status: boolean;
    message: string;
    message_code?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * تبدیل شماره موبایل به فرمت مورد قبول تابان (مثلاً: 09123456789)
 */
function formatRecipient(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("09")) {
    return digits;
  }

  if (digits.startsWith("+98")) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("98")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}

/**
 * تبدیل شماره خط خدماتی به فرمت مورد قبول تابان (بدون پیشوند کشور)
 */
function formatSender(sender: string): string {
  const digits = sender.replace(/\D/g, "");

  if (digits.startsWith("+98")) {
    return digits.slice(3);
  }

  if (digits.startsWith("98")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

/**
 * ارسال پیامک از طریق تابان اس‌ام‌اس
 */
export async function sendSms(params: SendSmsParams): Promise<TabaanSmsResponse> {
  const baseUrl = process.env.TABAN_SMS_BASE_URL;
  const apiKey = process.env.TABAN_SMS_API_KEY;
  const senderNumber = process.env.TABAN_SMS_SENDER_NUMBER;

  console.log("[Tabaan SMS] بررسی متغیرهای محیطی:", {
    hasBaseUrl: !!baseUrl,
    hasApiKey: !!apiKey,
    hasSenderNumber: !!senderNumber,
    baseUrl,
    senderNumber,
  });

  if (!baseUrl || !apiKey || !senderNumber) {
    const missing = [];
    if (!baseUrl) missing.push("TABAN_SMS_BASE_URL");
    if (!apiKey) missing.push("TABAN_SMS_API_KEY");
    if (!senderNumber) missing.push("TABAN_SMS_SENDER_NUMBER");
    throw new Error(`تنظیمات تابان اس‌ام‌اس کامل نیست. متغیرهای زیر موجود نیستند: ${missing.join(", ")}`);
  }

  const recipient = formatRecipient(params.phone);
  const fromNumber = formatSender(senderNumber);

  const requestBody = {
    sending_type: "webservice",
    from_number: fromNumber,
    message: params.message,
    params: {
      recipients: [recipient],
    },
  };

  console.log("[Tabaan SMS] درخواست ارسال:", {
    url: `${baseUrl}/api/send`,
    from: fromNumber,
    to: recipient,
    messageLength: params.message.length,
  });

  try {
    const response = await fetch(`${baseUrl}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Tabaan SMS] وضعیت پاسخ:", response.status, response.statusText);

    const data: TabaanApiResponse = await response.json();
    console.log("[Tabaan SMS] پاسخ API:", JSON.stringify(data, null, 2));

    // بررسی پاسخ موفق
    if (response.ok && data.meta?.status === true && data.data?.message_outbox_ids) {
      const messageId = data.data.message_outbox_ids[0]?.toString();
      return {
        success: true,
        messageId,
      };
    }

    // بررسی خطا
    const errorMessage = data.meta?.message || "خطا در ارسال پیامک";
    const errorCode = data.meta?.message_code || response.status.toString();

    return {
      success: false,
      error: errorMessage,
      errorCode,
    };
  } catch (error) {
    // خطاهای شبکه یا timeout
    const errorMessage = error instanceof Error ? error.message : "خطای شبکه در ارسال پیامک";
    console.error("[Tabaan SMS] ارسال ناموفق:", error);
    
    return {
      success: false,
      error: errorMessage,
      errorCode: "NETWORK_ERROR",
    };
  }
}

/**
 * ارسال پیامک OTP
 */
export async function sendOtpSms(phone: string, code: string): Promise<TabaanSmsResponse> {
  const message = `کد ورود شما: ${code}\n\nاین کد تا 5 دقیقه معتبر است.`;
  
  return sendSms({
    phone,
    message,
  });
}

