# 📊 وضعیت راه‌اندازی Neshan Map SDK

**تاریخ آخرین به‌روزرسانی:** 2025-01-28

---

## ✅ کارهای انجام شده

### 1. زیرساخت Android
- ✅ Permission ها به `AndroidManifest.xml` اضافه شد:
  - `INTERNET`
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`
- ✅ Maven Repository Neshan به `android/build.gradle.kts` اضافه شد
- ✅ Package Name به `ir.tamirban.app` تغییر یافت

### 2. فایل License
- ✅ فایل License دریافت شده: `assets/licenses/neshan.license`
- ✅ فایل در `pubspec.yaml` اضافه شده

### 3. آماده‌سازی برای API Key
- ✅ کامنت TODO در `AndroidManifest.xml` برای افزودن API Key بعداً
- ✅ نام صحیح meta-data: `com.neshan.maps.API_KEY`

### 4. کامپوننت اولیه نقشه
- ✅ ایجاد شده: `lib/features/visits/widgets/neshan_map_widget.dart`
- ✅ شامل مدل‌های `MapCoordinates` و `MapMarker`
- ✅ مدیریت حالت Loading و Error
- ✅ آماده برای اتصال به SDK واقعی

---

## ⏳ کارهای باقی‌مانده

### 1. دریافت API Key از پنل Neshan
**مقدار مورد نیاز:**
- **Bundle Name:** `ir.tamirban.app` ⚠️ به‌روزرسانی شده
- **SHA-1 (Debug):** `B5:E0:67:DE:D2:9B:6C:0B:84:A4:1C:B2:6D:C6:48:F2:B5:74:39:40`

**مراحل:**
1. به پنل Neshan مراجعه کنید
2. با Bundle Name جدید (`ir.tamirban.app`) API Key ایجاد کنید
3. API Key را دریافت و ذخیره کنید

مرجع: `NESHAN_FORM_VALUES.md`

### 2. نصب پکیج Neshan Map SDK
- ✅ نام پکیج پیدا شد: `neshanmap_flutter`
- ⚠️ **مشکل:** پکیج نیاز به Dart SDK >=3.9.0 دارد، اما پروژه فعلی از SDK 3.8.1 استفاده می‌کند
- ✅ کامنت آماده در `pubspec.yaml` برای نصب بعد از به‌روزرسانی SDK (خط 41-44)
- ✅ کامپوننت اولیه ایجاد شده: `lib/features/visits/widgets/neshan_map_widget.dart` با تمام قابلیت‌های لازم

### 3. افزودن API Key به AndroidManifest.xml
بعد از دریافت API Key:
```xml
<meta-data
    android:name="com.neshan.maps.API_KEY"
    android:value="YOUR_API_KEY_HERE" />
```

**نکته:** نام صحیح meta-data: `com.neshan.maps.API_KEY` (نه `neshan_api_key`)

### 4. پیاده‌سازی کامپوننت نقشه
- ✅ کامپوننت اولیه ایجاد شده: `lib/features/visits/widgets/neshan_map_widget.dart`
- [ ] بارگذاری License File در کد Flutter
- [ ] اتصال به SDK واقعی Neshan Map
- [ ] افزودن Markerها و مدیریت تعاملات

---

## 📝 فایل‌های مرتبط

- `android/app/src/main/AndroidManifest.xml` - Permission ها و آماده برای API Key
- `android/build.gradle.kts` - Maven Repository اضافه شده
- `assets/licenses/neshan.license` - فایل License
- `pubspec.yaml` - License File در assets

---

## 🎯 مراحل بعدی

1. **به‌روزرسانی Dart SDK** از 3.8.1 به >=3.9.0 (برای نصب neshanmap_flutter)
2. **دریافت API Key** با Bundle Name جدید (`ir.tamirban.app`)
3. **نصب پکیج** `neshanmap_flutter` (بعد از به‌روزرسانی SDK)
4. **افزودن API Key** به AndroidManifest.xml
5. **اتصال کامپوننت** به SDK واقعی Neshan Map

---

## 📌 نکات مهم

### محدودیت SDK
- پکیج `neshanmap_flutter` نیاز به Dart SDK >=3.9.0 دارد
- پروژه فعلی از SDK 3.8.1 استفاده می‌کند
- برای نصب پکیج، باید Flutter SDK به‌روزرسانی شود

### کامپوننت اولیه
- کامپوننت `NeshanMapWidget` در `lib/features/visits/widgets/neshan_map_widget.dart` ایجاد شده
- شامل مدل‌های `MapCoordinates` و `MapMarker` است
- آماده برای اتصال به SDK واقعی بعد از نصب پکیج

---

**برای ادامه، ابتدا Flutter SDK را به‌روزرسانی کنید و سپس API Key را دریافت کنید! 🚀**

