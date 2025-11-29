# گزارش وضعیت پروژه Flutter تعمیربان

**تاریخ بررسی:** 2025-11-28  
**وضعیت کلی:** ✅ زیرساخت آماده - نیاز به تکمیل ماژول‌ها

---

## ✅ **کارهای انجام شده**

### 1. ساختار پروژه و معماری
- ✅ ساختار فولدری feature-based آماده است (`lib/core`, `lib/data`, `lib/domain`, `lib/features`)
- ✅ State Management: Riverpod نصب و راه‌اندازی شده
- ✅ Navigation: go_router نصب شده
- ✅ HTTP Client: Dio با interceptor برای Authorization و Refresh Token

### 2. احراز هویت (Auth)
- ✅ OTP Login صفحه کامل با UI زیبا
- ✅ Token Storage: Secure Storage برای ذخیره توکن‌ها
- ✅ Refresh Token Flow: مدیریت خودکار refresh در ApiClient
- ✅ AuthProvider: مدیریت state با Riverpod
- ✅ Route Guard: AuthGuard برای محافظت صفحات

### 3. زیرساخت شبکه
- ✅ ApiClient: Dio با interceptor کامل
- ✅ ApiResponse: مدل استاندارد پاسخ API
- ✅ Environment Config: Development/Production
- ✅ Base URL: تنظیم شده برای localhost:3124 و tamirban1.ir

### 4. Theme و UI
- ✅ AppTheme: تعریف شده با رنگ‌ها و Typography
- ✅ RTL: راست‌چین تنظیم شده
- ✅ App Shell: Layout با Drawer و AppBar

---

## ⚠️ **کارهای ناتمام و نیاز به توجه**

### 1. **اولویت بالا - باید فوراً انجام شود**

#### الف) مدیریت خطا و ApiErrorCode
**مشکل:** 
- کدهای خطای API (UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, ...) در Flutter پیاده‌سازی نشده
- در `sample/lib/utils/errors.ts` وجود دارد ولی در Flutter نیست

**راه‌حل:**
- ایجاد `lib/core/errors/api_error.dart` با enum `ApiErrorCode`
- افزودن `code` به `ApiResponse`
- هندل کردن خطاها در UI بر اساس code

#### ب) Package Name و Bundle Name
**مشکل:**
- Package Name فعلی: `com.example.tamirban1android` (پیش‌فرض)
- باید به `ir.tamirban.app` یا `com.tamirban.mobile` تغییر یابد

**راه‌حل:**
- تغییر `applicationId` در `android/app/build.gradle.kts`
- تغییر Bundle ID در iOS (اگر نیاز باشد)
- این تغییر برای Neshan Map API Key ضروری است

#### ج) فونت ایران یکان
**مشکل:**
- فایل‌های فونت در `assets/fonts/` وجود ندارد
- فقط README.md موجود است

**راه‌حل:**
- دریافت فایل‌های فونت (IRANYekanXFaNum-Regular.ttf، Medium، Bold)
- افزودن به `pubspec.yaml`
- به‌روزرسانی Theme برای استفاده از فونت

---

### 2. **اولویت متوسط - برای مرحله بعد**

#### الف) نقشه Neshan (Neshan Map SDK)
**وضعیت:** 
- راهنمای کامل در `flutter-implementation-guide.md` موجود است
- نیاز به:
  1. دریافت API Key از پنل نشان (با Bundle Name و SHA-1)
  2. نصب `neshan_map_sdk` در `pubspec.yaml`
  3. افزودن API Key به `AndroidManifest.xml`
  4. افزودن Permission ها (INTERNET, LOCATION)

**نکته:** پس از تغییر Package Name انجام شود

#### ب) آیکون اپلیکیشن
**وضعیت:**
- آیکون پیش‌فرض Flutter استفاده می‌شود
- باید از `sample/public/favicon.png` استفاده شود

**راه‌حل:**
- تبدیل favicon.png به آیکون‌های Android/iOS
- قرار دادن در `android/app/src/main/res/mipmap-*/`
- و `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

#### ج) RBAC و Role Permissions
**وضعیت:**
- فایل `sample/lib/permissions/role-permissions.ts` موجود است
- در Flutter پیاده‌سازی نشده

**راه‌حل:**
- ایجاد `lib/core/permissions/role_permissions.dart`
- تعریف enum Role و permissions
- مخفی کردن UI elements بر اساس permission

---

### 3. **اولویت پایین - برای فازهای بعدی**

#### الف) ماژول‌های اصلی
- ❌ Customers: لیست، ایجاد، ویرایش، حذف
- ❌ Visits: لیست، ایجاد، ویرایش
- ❌ Invoices: لیست، ایجاد، ویرایش، PDF
- ❌ Marketers: لیست، مدیریت
- ❌ SMS Center: (بعد از تکمیل در وب)

#### ب) کامپوننت‌های مشترک UI
- ❌ Buttons: Primary, Secondary, Ghost, Danger
- ❌ Inputs: TextField با Label، ErrorText
- ❌ Cards: کارت‌های استاندارد
- ❌ Modals/Dialogs: فرم‌ها و تأیید عملیات
- ❌ Tables: لیست‌های ریسپانسیو
- ❌ Toast/Notification: پیام‌های موفقیت/خطا

#### ج) Empty/Loading/Error States
- ❌ Skeleton Loading
- ❌ Empty State
- ❌ Error State با retry

---

## 📋 **چک‌لیست کارهای فوری**

### امروز (اولویت 1):
1. [ ] **ایجاد ApiErrorCode enum** در `lib/core/errors/api_error.dart`
2. [ ] **افزودن `code` به ApiResponse** و هندل کردن در UI
3. [ ] **تغییر Package Name** از `com.example.tamirban1android` به `ir.tamirban.app`
4. [ ] **افزودن فونت ایران یکان** (اگر فایل‌ها موجود است)

### این هفته (اولویت 2):
5. [ ] **راه‌اندازی Neshan Map** (پس از تغییر Package Name)
6. [ ] **تغییر آیکون اپلیکیشن** به favicon
7. [ ] **پیاده‌سازی RBAC** و Role Permissions
8. [ ] **افزودن کامپوننت‌های مشترک UI** (Buttons, Inputs)

### فاز بعدی (اولویت 3):
9. [ ] **ماژول Customers** (CRUD کامل)
10. [ ] **ماژول Visits** (با نقشه Neshan)
11. [ ] **ماژول Invoices**
12. [ ] **ماژول Marketers**

---

## 🔍 **بررسی جزئیات**

### Dependencies نصب شده:
```
✅ hooks_riverpod: ^2.5.1
✅ dio: ^5.7.0
✅ flutter_secure_storage: ^9.2.2
✅ go_router: ^14.6.2
✅ intl: ^0.20.2
✅ flutter_localizations: SDK
```

### Dependencies مورد نیاز (هنوز اضافه نشده):
```
❌ neshan_map_sdk: ^1.0.0 (برای نقشه)
❌ flutter_dotenv یا flutter_config (برای متغیرهای محیطی - اختیاری)
❌ persian_datetime_picker (برای تاریخ شمسی)
❌ pdf_viewer (برای نمایش PDF فاکتورها)
❌ fluttertoast یا flutter_snackbar (برای Toast)
```

---

## 📝 **یادداشت‌های مهم**

### 1. Environment Variables
- متغیرهای محیطی در `flutter-implementation-guide.md` تعریف شده‌اند
- فعلاً در کد hardcode نشده (خوب است)
- برای Neshan Map API Key نیاز به راه‌حل مناسب است

### 2. API Base URL
- Development: `http://localhost:3124/api`
- Production: `https://tamirban1.ir/api`
- در `app_environment.dart` مدیریت می‌شود

### 3. Secure Storage
- ✅ به درستی راه‌اندازی شده
- ✅ از AndroidOptions و IOSOptions استفاده می‌کند
- ⚠️ در Web فعال نیست (null است) - باید بررسی شود

### 4. Refresh Token Flow
- ✅ در ApiClient پیاده‌سازی شده
- ✅ Queue برای جلوگیری از چند درخواست همزمان
- ✅ در صورت fail، token ها پاک می‌شوند

---

## 🎯 **پیشنهاد اقدام فوری**

### مرحله 1: رفع مشکلات زیرساختی (1-2 روز)
1. ایجاد ApiErrorCode و بهبود Error Handling
2. تغییر Package Name
3. اضافه کردن فونت (اگر در دسترس است)

### مرحله 2: تکمیل UI Components (2-3 روز)
1. Buttons و Inputs مشترک
2. Toast/Notification System
3. Loading/Empty/Error States

### مرحله 3: راه‌اندازی Neshan Map (1 روز)
1. دریافت API Key
2. نصب SDK
3. تنظیم Manifest

### مرحله 4: ماژول‌های اصلی (هر کدام 3-5 روز)
1. Customers
2. Visits
3. Invoices
4. Marketers

---

**آخرین به‌روزرسانی:** 2025-11-28

