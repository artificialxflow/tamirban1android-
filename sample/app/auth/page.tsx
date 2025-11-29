'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { OTPCard } from "@/components/auth/otp-card";

type MessageState = {
  type: "success" | "error" | "info";
  text: string;
};

export default function AuthPreviewPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [requestMessage, setRequestMessage] = useState<MessageState | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<MessageState | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const normalizedPhone = useMemo(() => phone.trim(), [phone]);

  const handleRequest = async () => {
    if (!normalizedPhone) {
      setRequestMessage({ type: "error", text: "لطفاً شماره موبایل را وارد کنید." });
      return;
    }

    setIsRequesting(true);
    setRequestMessage(null);

    console.log("[Frontend] شروع درخواست OTP برای شماره:", normalizedPhone);

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      console.log("[Frontend] وضعیت پاسخ:", response.status, response.statusText);

      const data = await response.json();
      console.log("[Frontend] داده پاسخ:", data);

      if (!response.ok || !data.success) {
        const errorMsg = data.message ?? "ارسال کد با خطا مواجه شد.";
        console.error("[Frontend] خطا در ارسال OTP:", errorMsg);
        throw new Error(errorMsg);
      }

      // اگر کد در پاسخ باشد (حالت تست بدون SMS)، نمایش می‌دهیم
      // در غیر این صورت، فقط پیام موفقیت نمایش می‌دهیم
      const messageText = data.code 
        ? `کد با موفقیت ارسال شد. (کد تست: ${data.code})`
        : "کد تایید به شماره موبایل شما ارسال شد. لطفاً پیامک را بررسی کنید.";
      
      console.log("[Frontend] پیام موفقیت:", messageText);
      
      setRequestMessage({
        type: "success",
        text: messageText,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "ارسال کد ناموفق بود.";
      console.error("[Frontend] خطا:", error);
      setRequestMessage({ type: "error", text: message });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerify = async () => {
    if (!normalizedPhone) {
      setVerifyMessage({ type: "error", text: "ابتدا شماره موبایل را وارد و کد را دریافت کنید." });
      return;
    }

    if (code.trim().length !== 4) {
      setVerifyMessage({ type: "error", text: "کد تایید باید چهار رقم باشد." });
      return;
    }

    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "ورود ناموفق بود.");
      }

      // ذخیره توکن‌ها و اطلاعات کاربر
      if (data.data) {
        const tokens = {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
          refreshExpiresIn: data.data.refreshExpiresIn,
        };
        localStorage.setItem("auth_tokens", JSON.stringify(tokens));
        localStorage.setItem("auth_user", JSON.stringify(data.data.user));
      }

      setVerifyMessage({ type: "success", text: "ورود موفق بود. در حال انتقال..." });
      
      // ریدایرکت به داشبورد بعد از 1 ثانیه
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "ورود ناموفق بود.";
      setVerifyMessage({ type: "error", text: message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    await handleRequest();
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <Image
        src="/auth-pattern.svg"
        alt=""
        width={1200}
        height={1200}
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-5xl opacity-10"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <header className="flex flex-col items-center gap-3 text-center text-white">
          <h1 className="text-4xl font-semibold md:text-5xl">ورود با شماره موبایل</h1>
          <p className="max-w-2xl text-base leading-8 text-slate-200">
            این صفحه برای تایید ساختار احراز هویت تعمیربان طراحی شده است. حالت دریافت کد و ورود کد را می‌توانید همزمان مشاهده کنید. این نسخه اکنون به سرویس OTP متصل شده است.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="rounded-full border border-white/20 px-4 py-2">حالت تست: OTP ثابت 0000</span>
            <span className="rounded-full border border-white/20 px-4 py-2">اعتبار کد: ۵ دقیقه</span>
            <span className="rounded-full border border-white/20 px-4 py-2">محدودیت تلاش: ۵ بار</span>
          </div>
        </header>

        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="relative">
            <div
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              className="absolute -top-6 left-6 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
            >
              گام ۱ — درخواست کد
            </div>
            <OTPCard
              variant="request"
              phone={phone}
              onPhoneChange={setPhone}
              onSubmit={handleRequest}
              loading={isRequesting}
              message={requestMessage}
            />
          </div>

          <div className="relative">
            <div className="absolute -top-6 left-6 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white shadow-soft">
              گام ۲ — ورود کد
            </div>
            <OTPCard
              variant="verify"
              phone={normalizedPhone}
              onSubmit={handleVerify}
              loading={isVerifying}
              message={verifyMessage}
              code={code}
              onCodeChange={setCode}
              onResend={handleResend}
              isDisabled={!normalizedPhone || code.length !== 4}
            />
          </div>
        </div>

        <section className="flex flex-col gap-4 rounded-3xl bg-white/5 p-6 text-sm text-slate-200 backdrop-blur">
          <header className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">یادداشت‌های طراحی</h2>
            <p className="text-xs text-slate-300">
              این نسخه برای تست ارتباط با MongoDB و صدور JWT از طریق OTP ثابت ۰۰۰۰ آماده شده است. برای محیط واقعی باید سرویس پیامک متصل شود.
            </p>
          </header>
          <ul className="grid gap-2 text-xs leading-7 md:grid-cols-2">
            <li>• ورودی شماره موبایل با اعتبارسنجی سمت سرور</li>
            <li>• نمایش پیام‌های موفقیت و خطا در هر دو گام</li>
            <li>• امکان ارسال مجدد کد و دریافت JWT بدون نمایش مستقیم آن در UI</li>
            <li>• آماده برای جایگزینی با OTP واقعی در آینده</li>
          </ul>
          <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <Link href="/" className="underline underline-offset-4 transition hover:text-white">
              بازگشت به صفحه اصلی
            </Link>
            <span>آخرین بروزرسانی ماک: فاز ۳ — UI احراز هویت</span>
          </footer>
        </section>
      </div>
    </div>
  );
}

