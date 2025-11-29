# طرح اولیه احراز هویت تعمیربان (فاز ۵)

این سند نقشهٔ راه و تصمیمات کلیدی برای پیاده‌سازی احراز هویت مبتنی بر OTP و JWT را مشخص می‌کند. هدف این فاز ایجاد زیرساخت ورود با شماره موبایل، مدیریت نقش‌ها و آماده‌سازی برای گسترش آزمایشی سرویس پیامکی است.

## معماری کلی

1. **ثبت درخواست OTP**
   - Endpoint: `POST /api/auth/otp/request`
   - ورودی: `mobile`, `channel` (پیش‌فرض `SMS`)
   - عملیات:
     - بررسی الگوی شماره موبایل ایران (+۹۸ یا ۰۹)
     - جستجوی کاربر موجود؛ در صورت نبودن، ایجاد حساب با نقش پیش‌فرض (مثلاً `MARKETER` یا `CUSTOMER` بر اساس سناریو)
     - تولید کد یک‌بارمصرف ۴ یا ۶ رقمی؛ ذخیره هش‌شده با `bcrypt`
     - ثبت رکورد در `SMSLog` با وضعیت `QUEUED`
     - در حالت تست، برگرداندن کد ثابت از متغیر `OTP_TEST_CODE`

2. **تایید کد OTP**
   - Endpoint: `POST /api/auth/otp/verify`
   - ورودی: `mobile`, `code`
   - عملیات:
     - بازیابی رکورد OTP؛ بررسی انقضا و تعداد تلاش‌ها (`OTPAttempt`)
     - مقایسه با `bcrypt.compare`
     - تولید `accessToken` (JWT با ادعاهای `sub`, `role`, `sessionId`)
     - تولید `refreshToken` در صورت نیاز؛ ذخیره در حافظه پایدار/collection جداگانه
     - به‌روزرسانی `lastLoginAt` و ثبت لاگ امنیتی

3. **ساختار JWT**
   - الگوریتم امضا: `HS256` با کلید `JWT_SECRET`
   - Payload اصلی:
     ```json
     {
       "sub": "<userId>",
       "role": "MARKETER",
       "sessionId": "<uuid>",
       "iat": 1736400000,
       "exp": 1736403600
     }
     ```
   - مدت اعتبار توکن دسترسی: ۱ ساعت
   - رفرش توکن (اختیاری) با اعتبار ۷ روز و کلید `JWT_REFRESH_SECRET`

4. **استراتژی جایگزین**
   - در صورت آماده بودن، می‌توان OTP را با NextAuth و Credential Provider پیاده‌سازی کرد، اما رویکرد فعلی کنترل کامل‌تری روی API مشترک وب/اندروید ارائه می‌دهد.

## لایه سرویس پیشنهادی

### AuthService
- `requestOtp(mobile: string, channel?: OTPChannel)`
- `verifyOtp(mobile: string, code: string)`
- `issueTokens(user: User)`
- `invalidateSessions(userId: string)`

### UserService
- `findOrCreateByMobile(mobile: string)`
- `attachRole(userId: string, role: RoleKey)`
- `logSecurityEvent(userId: string, action: string, metadata?: Record<string, unknown>)`

### SmsService
- `sendOtp(mobile: string, code: string)`
- `logSms(payload: Partial<SMSLog>)`

## کنترل‌های امنیتی
- محدود کردن تعداد درخواست OTP (مثلاً ۵ بار در ساعت برای هر شماره)
- نگهداری `OTPAttempt` در collection یا Redis با TTL کوتاه
- اجباری بودن `isActive = true` برای ورود (تعلیق کاربران با نقش‌های خاص)
- ساخت endpoint برای خروج و باطل کردن refresh token

## تست‌های پیشنهادی
- **واحد:** 
  - تولید کد OTP و هش کردن با `bcrypt`
  - اعتبارسنجی JWT (امضا و انقضا)
  - سرویس ارسال پیامک در حالت تست (عدم تماس با سرویس واقعی)
- **یکپارچه:** 
  - `requestOtp` → ذخیره OTPAttempt و ثبت SMSLog
  - `verifyOtp` → تولید JWT و به‌روزرسانی `lastLoginAt`
  - سناریوی تلاش ناموفق متوالی → قفل موقت حساب
- **End-to-End (پس از پیاده‌سازی API):**
  - فلو کامل «درخواست تا تایید OTP» با حالت تست
  - اعتبارسنجی نقش‌ها برای مسیرهای محافظت‌شده (مثلاً `/api/dashboard`)
  - تایید ماندگاری رفرش‌توکن و خروج کاربر

## وضعیت بعد از فاز ۵
- آماده‌سازی endpointهای محافظت‌شده با middleware بررسی JWT
- مستندسازی در Postman (`Auth` folder)
- هماهنگی با تیم اندروید برای فرمت پاسخ‌ها (`accessToken`, `refreshToken`, `expiresIn`)

> این سند با پیشرفت توسعه به‌روزرسانی می‌شود. لطفاً پس از پیاده‌سازی واقعی، مقادیر دقیق (طول کد، مدت اعتبار، سیاست قفل) را نهایی کنید.

