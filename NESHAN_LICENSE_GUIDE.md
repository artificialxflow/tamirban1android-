# راهنمای استفاده از Neshan License File

## 📋 درباره فایل `neshan.license`

بله، این فایل **قابل استفاده** است! ✅

این فایل **License** مربوط به Neshan Map SDK برای Android است که از پنل Neshan دانلود کرده‌اید.

---

## 🔍 تفاوت بین License File و API Key

در Neshan Map SDK دو چیز وجود دارد:

1. **API Key** (که در AndroidManifest.xml قرار می‌گیرد)
   - معمولاً به صورت `android.xxxxxxxxxxxxx...` است
   - در پنل Neshan، در کنار "دریافت لایسنس" ممکن است یک API Key هم نمایش داده شود

2. **License File** (که همین فایلی است که دارید)
   - فایل `.license` که حاوی اطلاعات مجوز SDK است
   - معمولاً برای برخی نسخه‌های SDK لازم است

---

## ✅ چک کنید: آیا API Key هم دارید؟

در پنل Neshan، در کارت **"TamirBan Android App"** که ایجاد کردید:

1. آیا یک **API Key** یا **کلید دسترسی** نمایش داده می‌شود؟
   - معمولاً به صورت: `android.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - یا در بخش دیگری از پنل

2. یا فقط همین دکمه **"دریافت لایسنس"** را دیدید؟

---

## 🚀 نحوه استفاده از License File در Flutter

### گزینه 1: استفاده از License File (اگر SDK فقط License می‌خواهد)

1. **قرار دادن فایل در پروژه:**
   ```bash
   # فایل را به پوشه assets منتقل کنید
   assets/licenses/neshan.license
   ```

2. **افزودن به `pubspec.yaml`:**
   ```yaml
   flutter:
     assets:
       - assets/licenses/neshan.license
   ```

3. **بارگذاری در کد Flutter:**
   ```dart
   import 'package:flutter/services.dart';
   
   Future<String> loadNeshanLicense() async {
     return await rootBundle.loadString('assets/licenses/neshan.license');
   }
   ```

### گزینه 2: استفاده از API Key در AndroidManifest.xml (رایج‌تر)

اگر در پنل Neshan یک **API Key** هم دارید:

1. **افزودن به `AndroidManifest.xml`:**
   ```xml
   <manifest xmlns:android="http://schemas.android.com/apk/res/android">
       <application>
           <!-- Neshan Map API Key -->
           <meta-data
               android:name="neshan_api_key"
               android:value="YOUR_API_KEY_HERE" />
       </application>
   </manifest>
   ```

---

## 💡 توصیه من:

**ابتدا بررسی کنید که در پنل Neshan چه چیز دیگری دارید:**

1. در کارت **"TamirBan Android App"**:
   - آیا یک متن یا کد (مثلاً `android.xxxxx...`) نمایش داده می‌شود؟
   - یا فقط همین License File را دارید؟

2. **اگر API Key هم دارید:**
   - از API Key استفاده کنید (روش رایج‌تر)
   - License File را هم نگه دارید (ممکن است بعداً نیاز شود)

3. **اگر فقط License File دارید:**
   - از License File استفاده کنید
   - آن را در `assets/licenses/` قرار دهید

---

## 📝 مراحل بعدی:

**لطفاً به من بگویید:**

1. آیا در پنل Neshan یک **API Key** هم می‌بینید؟ (مثلاً در کارت یا بخش دیگری)
2. یا فقط همین License File را دارید؟

بر اساس جواب شما، مراحل کامل راه‌اندازی را برایتان انجام می‌دهم! 🚀

---

## 🔗 منابع مفید:

- مستندات Neshan Map SDK: https://platform.neshan.org/docs/android/getting-started/
- پنل Neshan: https://platform.neshan.org/panel/

