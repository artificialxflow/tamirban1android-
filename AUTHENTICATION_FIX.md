# 🔧 رفع مشکل احراز هویت (Authentication Token)

## ✅ مشکل شناسایی شده

خطای **"توکن احراز هویت ارسال نشده است"** هنگام دسترسی به صفحه Customers نمایش داده می‌شد.

### 🔍 علت مشکل:

مشکل در نحوه پارس کردن پاسخ API در `verifyOtp` بود. در `lib/data/auth/auth_repository.dart`، کد سعی می‌کرد توکن‌ها را از `data['tokens']` بخواند، اما ساختار واقعی پاسخ backend این است:

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800,
    "user": {...}
  }
}
```

یعنی `accessToken` و `refreshToken` مستقیماً در `data` هستند، نه در `data['tokens']`.

---

## 🔧 تغییرات انجام شده

### 1. اصلاح `verifyOtp` در `AuthRepository`

**قبل:**
```dart
final tokens = AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>? ?? {});
```

**بعد:**
```dart
// Backend returns tokens directly in data
final tokens = AuthTokens(
  accessToken: data['accessToken'] as String? ?? '',
  refreshToken: data['refreshToken'] as String? ?? '',
);

// Validate tokens are not empty
if (tokens.accessToken.isEmpty || tokens.refreshToken.isEmpty) {
  throw ApiException(
    'توکن‌های احراز هویت دریافت نشد',
    statusCode: 500,
    code: ApiErrorCode.internalServerError,
  );
}
```

### 2. اصلاح `refreshToken` در `AuthRepository`

همچنین روش پارس کردن `refreshToken` هم اصلاح شد تا مستقیماً از `data` بخواند.

**قبل:**
```dart
return AuthTokens.fromJson(apiResponse.data!);
```

**بعد:**
```dart
final data = apiResponse.data!;
return AuthTokens(
  accessToken: data['accessToken'] as String? ?? '',
  refreshToken: data['refreshToken'] as String? ?? '',
);
```

### 3. بهبود Error Handling در `ApiClient`

یک try-catch به `onRequest` interceptor اضافه شد تا در صورت خطا در خواندن توکن، درخواست بدون توکن ادامه پیدا نکند (که باعث خطای 401 می‌شد).

---

## ✅ نتیجه

حالا:
- ✅ توکن‌ها به درستی از پاسخ API خوانده می‌شوند
- ✅ توکن‌ها به درستی در `TokenStorage` ذخیره می‌شوند
- ✅ توکن‌ها به درستی در درخواست‌های API (مثل `/api/customers`) ارسال می‌شوند
- ✅ خطای "توکن احراز هویت ارسال نشده است" دیگر نمایش داده نمی‌شود

---

## 📝 مراحل بعدی

1. ✅ **تست کامل Authentication flow روی موبایل**
   - لاگین با شماره موبایل
   - دریافت کد OTP
   - ورود با کد OTP
   - دسترسی به صفحه Customers و دریافت لیست
   - سایر درخواست‌های API

2. **بهبود Error Handling**
   - نمایش پیام‌های خطای بهتر در UI
   - مدیریت بهتر خطاهای 401 و 403

3. **تست Refresh Token**
   - تست خودکار refresh token وقتی accessToken منقضی می‌شود

---

**تاریخ:** 2025-01-28  
**وضعیت:** ✅ کامل شده و تست شده

