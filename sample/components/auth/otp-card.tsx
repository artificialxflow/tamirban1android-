'use client';

import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { useMemo, useRef } from "react";

type MessageState = {
  type: "success" | "error" | "info";
  text: string;
};

type OTPCardProps = {
  variant: "request" | "verify";
  phone: string;
  onPhoneChange?: (value: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  message?: MessageState | null;
  code?: string;
  onCodeChange?: (value: string) => void;
  onResend?: () => void;
  info?: string | null;
  isDisabled?: boolean;
};

const MESSAGE_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-600",
  info: "border-primary-200 bg-primary-50 text-primary-700",
};

export function OTPCard({
  variant,
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  message,
  code = "",
  onCodeChange,
  onResend,
  info,
  isDisabled,
}: OTPCardProps) {
  const isRequest = variant === "request";
  const digits = useMemo(() => {
    const normalized = (code ?? "").slice(0, 4);
    return Array.from({ length: 4 }, (_, index) => normalized[index] ?? "");
  }, [code]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      onSubmit?.();
    }
  };

  const handlePhoneInput = (event: ChangeEvent<HTMLInputElement>) => {
    onPhoneChange?.(event.target.value);
  };

  const handleDigitChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!onCodeChange) {
      return;
    }
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    const buffer = digits.slice();
    buffer[index] = value;
    onCodeChange(buffer.join(""));

    if (value && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (!onCodeChange) {
      return;
    }

    if (event.key === "Backspace" && !digits[index] && inputsRef.current[index - 1]) {
      event.preventDefault();
      const buffer = digits.slice();
      buffer[index - 1] = "";
      onCodeChange(buffer.join(""));
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!onCodeChange) {
      return;
    }
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      event.preventDefault();
      onCodeChange(pasted);
      inputsRef.current[pasted.length - 1]?.focus();
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border-2 border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/50 backdrop-blur">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-sm font-semibold text-primary-600">
          <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" />
          ورود به تعمیربان
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {isRequest ? "کد تایید را دریافت کنید" : "کد ارسال‌شده را وارد کنید"}
        </h1>
        <p className="text-sm leading-7 text-slate-600">
          {isRequest
            ? "شماره موبایل کاری خود را وارد کنید تا کد تایید برایتان ارسال شود."
            : phone
              ? `کد چهار رقمی ارسال‌شده به شماره ${phone} را وارد کنید.`
              : "کد چهار رقمی ارسال‌شده را وارد کنید."}
        </p>
      </header>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${MESSAGE_STYLES[message.type]}`}
        >
          {message.text}
        </div>
      ) : null}

      {info ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {info}
        </div>
      ) : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {isRequest ? (
          <>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              شماره موبایل
              <div className="relative">
                <input
                  type="tel"
                  placeholder="مثال: 09123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  value={phone}
                  onChange={handlePhoneInput}
                  inputMode="numeric"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  +98
                </span>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-500" />
              مرا به سیستم بازاریاب‌ها اضافه کن
            </label>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              کد تایید
              <div className="flex items-center justify-between gap-3" dir="ltr">
                {digits.map((digit, index) => (
                  <input
                    key={`otp-digit-${index}`}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    maxLength={1}
                    dir="ltr"
                    className="h-14 w-14 rounded-2xl border-2 border-slate-300 bg-white text-center text-lg font-semibold text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 shadow-sm"
                    onChange={handleDigitChange(index)}
                    onKeyDown={handleDigitKeyDown(index)}
                    onPaste={index === 0 ? handleDigitPaste : undefined}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>کد تست فعلی: 0000</span>
              <button
                type="button"
                className="font-semibold text-primary-600 hover:text-primary-700"
                onClick={onResend}
                disabled={loading}
              >
                ارسال مجدد کد
              </button>
            </div>
          </>
        )}

        <button
          type="submit"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          className="mt-2 inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || isDisabled}
        >
          {loading ? "در حال پردازش..." : isRequest ? "دریافت کد تایید" : "ورود به داشبورد"}
        </button>
      </form>

      <footer className="flex flex-col gap-2 text-xs text-slate-500">
        {isRequest ? (
          <span>
            با ورود به سیستم، شرایط و قوانین تعمیربان را می‌پذیرم. کد ارسال‌شده تنها ۵ دقیقه اعتبار دارد.
          </span>
        ) : (
          <span>در صورت بروز مشکل با واحد پشتیبانی تماس بگیرید: ۰۲۱-۱۲۳۴۵۶۷۸</span>
        )}

        <div className="flex items-center justify-between">
          <span>پشتیبانی ۲۴/۷</span>
          <span>نسخه ۰.۱</span>
        </div>
      </footer>
    </div>
  );
}

