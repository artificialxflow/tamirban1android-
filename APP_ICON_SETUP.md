# 📱 راهنمای تنظیم آیکن اپلیکیشن

## ✅ وضعیت: **تکمیل شده**

آیکن اپلیکیشن با موفقیت از `sample/public/favicon.png` تنظیم شده است.

---

## 🎨 آیکن فعلی

- **منبع:** `sample/public/favicon.png`
- **ویژگی‌ها:** 
  - حرف "ث" (tha) سفید
  - دایره نارنجی
  - پس‌زمینه آبی تیره

---

## 🔧 تنظیمات انجام شده

### 1. کپی آیکن اصلی
- ✅ فایل `sample/public/favicon.png` به `assets/icons/app_icon.png` کپی شد

### 2. اضافه شدن پکیج
- ✅ `flutter_launcher_icons: ^0.13.1` به `dev_dependencies` اضافه شد

### 3. تنظیمات در `pubspec.yaml`
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#0F172A" # Dark blue background
  adaptive_icon_foreground: "assets/icons/app_icon.png"
  min_sdk_android: 21
  remove_alpha_ios: true
```

### 4. تولید آیکن‌ها
- ✅ آیکن‌های Android برای تمام سایزها تولید شد
- ✅ آیکن‌های iOS تولید شد
- ✅ Adaptive Icons برای Android تولید شد
- ✅ فایل `colors.xml` برای Android ایجاد شد

---

## 📁 فایل‌های تولید شده

### Android:
- `android/app/src/main/res/mipmap-*/ic_launcher.png` (برای تمام سایزها)
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png` (برای Android 7.1+)
- `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png` (Adaptive Icon)
- `android/app/src/main/res/values/colors.xml` (رنگ پس‌زمینه Adaptive Icon)

### iOS:
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/*.png` (برای تمام سایزها)

---

## ✅ نتیجه

وقتی اپ را روی گوشی نصب می‌کنید:
- ✅ آیکن اپلیکیشن نمایش داده می‌شود
- ✅ در Android: Adaptive Icon (با پس‌زمینه آبی تیره)
- ✅ در iOS: آیکن استاندارد

---

## 🔄 تغییر آیکن در آینده

اگر می‌خواهید آیکن را تغییر دهید:

1. فایل جدید را جایگزین کنید:
   ```bash
   # فایل جدید را در assets/icons/app_icon.png قرار دهید
   ```

2. آیکن‌ها را دوباره تولید کنید:
   ```bash
   flutter pub run flutter_launcher_icons
   ```

3. یا با دستور جدید:
   ```bash
   dart run flutter_launcher_icons
   ```

---

## 📝 یادداشت‌ها

- آیکن اصلی باید حداقل 1024x1024 پیکسل باشد (بهتر است)
- پس‌زمینه Adaptive Icon در Android: `#0F172A` (آبی تیره - مطابق با آیکن)
- در iOS، alpha channel به صورت خودکار حذف می‌شود (`remove_alpha_ios: true`)

---

## ✅ وضعیت فعلی

- ✅ آیکن برای Android تنظیم شده
- ✅ آیکن برای iOS تنظیم شده
- ✅ Adaptive Icon برای Android تنظیم شده
- ✅ همه سایزها تولید شده‌اند

**آیکن اپلیکیشن آماده است!** 🎉
